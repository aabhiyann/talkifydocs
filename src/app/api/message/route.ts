// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";
import { db } from "@/db";
import { openai } from "@/lib/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { OpenAIStream, StreamingTextResponse } from "ai";

import { NextRequest } from "next/server";
import { use } from "react";
import { handleError, createErrorResponse, AuthenticationError, NotFoundError, ValidationError } from "@/lib/errors";

export const POST = async (req: NextRequest) => {
  try {
    // endpoint for asking a question to a pdf
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      throw new AuthenticationError("User not authenticated");
    }

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

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId: user.id,
        fileId,
      },
    });

    // after
    // 1: vectorize message
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("talkifydocs");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
      where: {
        fileId,
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

    const response = await openai.chat.completions.create({
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
    ${results.map((r) => r.pageContent).join("\n\n")}
    
    USER INPUT: ${message}`,
        },
      ],
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await db.message.create({
          data: {
            text: completion,
            isUserMessage: false,
            fileId,
            userId: user.id,
          },
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Message API error:", error);
    const errorResponse = handleError(error);
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
