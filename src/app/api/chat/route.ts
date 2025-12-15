import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { requireUser } from "@/lib/auth";
import { hybridSearch } from "@/lib/ai/hybrid-search";
import {
  handleError,
  AuthenticationError,
  ValidationError,
  AppError,
} from "@/lib/errors";
import {
  checkRateLimit,
  validateRequest,
  getClientIP,
  getSecurityHeaders,
} from "@/lib/security";
import { loggers, logPerformance, logError } from "@/lib/logger";

type IncomingChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(req);

  try {
    // Basic request validation
    const requestValidation = validateRequest(req);
    if (!requestValidation.valid) {
      throw new ValidationError(requestValidation.error || "Invalid request");
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(clientIP, "MESSAGE");
    if (!rateLimit.allowed) {
      throw new ValidationError("Rate limit exceeded. Please try again later.");
    }

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray((body as any).messages) ||
      typeof (body as any).conversationId !== "string"
    ) {
      throw new ValidationError("Invalid request body");
    }

    const { messages, conversationId } = body as {
      messages: IncomingChatMessage[];
      conversationId: string;
    };

    if (!messages.length) {
      throw new ValidationError("At least one message is required");
    }

    const user = await requireUser().catch(() => {
      throw new AuthenticationError("User not authenticated");
    });

    // Verify conversation ownership and load attached files
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

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    // Persist user message
    await db.message.create({
      data: {
        text: query,
        isUserMessage: true,
        userId: user.id,
        conversationId: conversation.id,
      },
    });

    const fileIds = conversation.conversationFiles.map((cf) => cf.fileId);

    // Retrieve relevant context via hybrid search
    const relevantDocs = await hybridSearch(query, fileIds, 4);

    const context = relevantDocs
      .map(
        (doc, i) =>
          `[Source ${i + 1}] (fileId=${String(
            (doc.metadata as any)?.fileId ?? ""
          )}, page=${String((doc.metadata as any)?.page ?? "?" )})\n${
            doc.pageContent
          }`
      )
      .join("\n\n");

    // Recent conversation history (short for context window)
    const recentMessages = await db.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const conversationHistory = recentMessages
      .reverse()
      .map((m) => `${m.isUserMessage ? "Human" : "Assistant"}: ${m.text}`)
      .join("\n");

    const systemPrompt = `You are a helpful AI assistant analyzing one or more PDF documents for the user.
Answer the user's question based ONLY on the provided context. If the answer cannot be found in the context,
explicitly say: "I don't have enough information in the provided documents to answer that question."

Always cite your sources by referencing the source number, e.g. "According to Source 1...".
Do not invent citations or reference pages that are not in the context.

Context:
${context}

Conversation history:
${conversationHistory}`;

    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      stream: true,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const stream = OpenAIStream(openaiResponse as any, {
      async onCompletion(completion) {
        try {
          await db.message.create({
            data: {
              text: completion,
              isUserMessage: false,
              userId: user.id,
              conversationId: conversation.id,
              citations: relevantDocs.map((doc, index) => ({
                source: index + 1,
                fileId: (doc.metadata as any)?.fileId ?? fileIds[0],
                page:
                  (doc.metadata as any)?.page ??
                  (typeof (doc.metadata as any)?.pageIndex === "number"
                    ? (doc.metadata as any).pageIndex + 1
                    : undefined),
                snippet: doc.pageContent.slice(0, 200),
                title:
                  (doc.metadata as any)?.title ??
                  (doc.metadata as any)?.fileName ??
                  undefined,
              })),
            },
          });
        } catch (err) {
          logError(err as Error, {
            operation: "chat_store_completion",
            userId: user.id,
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

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    logError(error as Error, {
      operation: "chat_post",
      userId: undefined,
      conversationId: undefined,
    });

    const errorResponse = handleError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}


