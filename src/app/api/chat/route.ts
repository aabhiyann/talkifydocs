import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { requireUser, AuthenticatedUser } from "@/lib/auth";
import { hybridSearch } from "@/lib/ai/hybrid-search";
import { handleError, AuthenticationError, ValidationError, AppError } from "@/lib/errors";
import { checkRateLimit, validateRequest, getSecurityHeaders } from "@/lib/security";
import { logPerformance, logError } from "@/lib/logger";
import { IncomingChatMessage, DocumentMetadata } from "@/types/chat";
import { AI } from "@/config/ai";
import { RATE_LIMIT_KEYS } from "@/config/constants";
import { withTimeout } from "@/lib/utils";
import { Document } from "@langchain/core/documents";
import { getLlmClient } from "@/lib/ai/llm";

type ChatRequestBody = {
  messages: IncomingChatMessage[];
  conversationId: string;
};

async function validateAndGetChatRequestBody(req: NextRequest): Promise<ChatRequestBody> {
  const requestValidation = validateRequest(req);
  if (!requestValidation.valid) {
    throw new ValidationError(requestValidation.error || "Invalid request");
  }

  const body = await req.json();

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray(body.messages) ||
    typeof body.conversationId !== "string"
  ) {
    throw new ValidationError("Invalid request body");
  }

  if (!body.messages.length) {
    throw new ValidationError("At least one message is required");
  }

  return body as ChatRequestBody;
}

async function authenticateAndAuthorize(conversationId: string, user: AuthenticatedUser) {
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      userId: user.id,
    },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new ValidationError("Conversation not found");
  }

  return conversation;
}

function getContext(relevantDocs: (Document & { metadata: DocumentMetadata })[]): string {
  return relevantDocs
    .map(
      (doc, i) =>
        `[Source ${i + 1}] (fileId=${doc.metadata.fileId}, page=${
          doc.metadata.page ?? "?"
        })\n${doc.pageContent}`,
    )
    .join("\n\n");
}

async function getConversationHistory(conversationId: string): Promise<string> {
  const recentMessages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return recentMessages
    .reverse()
    .map((m) => `${m.isUserMessage ? "Human" : "Assistant"}: ${m.text}`)
    .join("\n");
}

function createSystemPrompt(context: string, conversationHistory: string): string {
  return `You are a helpful AI assistant analyzing one or more PDF documents for the user.
Answer the user's question based ONLY on the provided context. If the answer cannot be found in the context,
explicitly say: "I don't have enough information in the provided documents to answer that question."

Always cite your sources by referencing the source number, e.g. "According to Source 1...".
Do not invent citations or reference pages that are not in the context.

Context:
${context}

Conversation history:
${conversationHistory}`;
}

function createCitation(
  doc: Document & { metadata: DocumentMetadata },
  index: number,
  fileIds: string[],
) {
  return {
    source: index + 1,
    fileId: doc.metadata.fileId ?? fileIds[0],
    page:
      doc.metadata.page ??
      (typeof doc.metadata.pageIndex === "number" ? doc.metadata.pageIndex + 1 : undefined),
    snippet: doc.pageContent.slice(0, 200),
    title: doc.metadata.title ?? doc.metadata.fileName ?? undefined,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let user: AuthenticatedUser | null = null;
  let conversationId: string | undefined;

  try {
    const body = await validateAndGetChatRequestBody(req);
    conversationId = body.conversationId;

    user = await requireUser().catch(() => {
      throw new AuthenticationError("User not authenticated");
    });

    const rateLimit = await checkRateLimit(user.id, RATE_LIMIT_KEYS.MESSAGE);
    if (!rateLimit.allowed) {
      throw new ValidationError("Rate limit exceeded. Please try again later.");
    }

    const conversation = await authenticateAndAuthorize(conversationId, user);
    const lastMessage = body.messages[body.messages.length - 1];
    const query = lastMessage.content;

    await db.message.create({
      data: {
        text: query,
        isUserMessage: true,
        userId: user.id,
        conversationId: conversation.id,
      },
    });

    const fileIds = conversation.conversationFiles.map((cf) => cf.fileId);
    const relevantDocs = await withTimeout(hybridSearch(query, fileIds, 4), 30000);
    const context = getContext(relevantDocs);
    const conversationHistory = await getConversationHistory(conversation.id);
    const systemPrompt = createSystemPrompt(context, conversationHistory);

    const llmClient = getLlmClient("groq");
    const llmResponse = await llmClient.createChatCompletion({
      model: AI.MODEL_NAME,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
    });

    const stream = OpenAIStream(llmResponse, {
      async onCompletion(completion: string) {
        try {
          await db.message.create({
            data: {
              text: completion,
              isUserMessage: false,
              userId: user!.id,
              conversationId: conversation.id,
              citations: relevantDocs.map((doc, index) => createCitation(doc, index, fileIds)),
            },
          });
        } catch (err) {
          logError(err as Error, {
            operation: "chat_store_completion",
            userId: user!.id,
            conversationId: conversation.id,
          });
        }
      },
    });

    logPerformance("chat_processing", startTime, {
      userId: user.id,
      conversationId: conversation.id,
    });

    const response = new StreamingTextResponse(stream);
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    const errorResponse = handleError(error, {
      operation: "chat_post",
      userId: user?.id,
      conversationId,
    });
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}
