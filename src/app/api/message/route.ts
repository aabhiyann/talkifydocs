import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { requireUser } from "@/lib/auth";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { LangChainStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import {
  handleError,
  createErrorResponse,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  AppError,
} from "@/lib/errors";
import { loggers, logPerformance, logError } from "@/lib/logger";
import { checkRateLimit, validateRequest, getClientIP, getSecurityHeaders } from "@/lib/security";
import { validateRequest as validateInput, messageSchema } from "@/lib/validation";
import { Document } from "@langchain/core/documents";

export const POST = async (req: NextRequest) => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);

  try {
    // Validate request
    const requestValidation = validateRequest(req);
    if (!requestValidation.valid) {
      throw new ValidationError(requestValidation.error || "Invalid request");
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "MESSAGE");
    if (!rateLimit.allowed) {
      throw new ValidationError("Rate limit exceeded. Please try again later.");
    }

    // endpoint for asking a question to a pdf
    const body = await req.json();

    // Validate input
    const inputValidation = validateInput(messageSchema)(body);
    if (!inputValidation.success) {
      throw new ValidationError(inputValidation.error || "Invalid input");
    }

    loggers.api.info(
      {
        operation: "message_post",
        userAgent: req.headers.get("user-agent"),
        clientIP,
        rateLimitRemaining: rateLimit.remaining,
      },
      "Message API request started",
    );

    const user = await requireUser().catch(() => {
      throw new AuthenticationError("User not authenticated");
    });

    const { fileId, message } = sendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!file) {
      throw new NotFoundError("File");
    }

    // Create or reuse a conversation for this file+user
    let conversation = await db.conversation.findFirst({
      where: {
        userId: user.id,
        conversationFiles: {
          some: {
            fileId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          title: file.name,
          userId: user.id,
          conversationFiles: {
            create: {
              fileId,
            },
          },
        },
      });
    }

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId: user.id,
        fileId,
        conversationId: conversation.id,
      },
    });

    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorStore = (await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: pineconeIndex,
      namespace: file.id,
    })) as PineconeStore;

    const results = (await vectorStore.similaritySearch(message, 4)) as Document[];

    const prevMessages = await db.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));

    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
        },
        {
          role: "user",
          content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
          
    \n----------------\n
    
    PREVIOUS CONVERSATION:
    ${formattedPrevMessages.map((message) => {
      if (message.role === "user") return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })}
    
    \n----------------\n
    CONTEXT:
    ${results.map((r: Document) => r.pageContent).join("\n\n")}
    
    USER INPUT: ${message}`,
        },
      ],
    });

    const { stream, writer } = LangChainStream({
      async onCompletion(completion: string) {
        await db.message.create({
          data: {
            text: completion,
            isUserMessage: false,
            fileId,
            userId: user.id,
            conversationId: conversation.id,
          },
        });
      },
    });

    (async () => {
      for await (const chunk of openaiResponse) {
        writer.write(chunk);
      }
      writer.close();
    })();

    logPerformance("message_processing", startTime, {
      fileId,
      userId: user.id,
    });

    const response = new StreamingTextResponse(stream);

    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    logError(error as Error, {
      operation: "message_post",
      fileId: undefined,
      userId: undefined,
    });

    const errorResponse = handleError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
};
