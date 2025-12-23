import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";
import { AI } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, message } = body;

    const user = await getCurrentUser();
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });

    if (!message) return new NextResponse("Message required", { status: 400 });

    const file = await db.file.findFirst({
        where: { id: fileId, userId: user.id },
    });
    if (!file) return new NextResponse("File not found", { status: 404 });

    // Find or create conversation
    let conversation = await db.conversation.findFirst({
        where: {
            userId: user.id,
            conversationFiles: { some: { fileId } },
        },
    });

    if (!conversation) {
        conversation = await db.conversation.create({
            data: {
                title: file.name,
                userId: user.id,
                conversationFiles: { create: { fileId } },
            },
        });
    }

    // Save user message
    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId: user.id,
            fileId,
            conversationId: conversation.id,
        },
    });

    // Vector search - Using Gemini Embeddings
    let results: any[] = [];
    let isContextFallback = false;
    try {
        console.log("[Chat] Attempting vector search with Gemini");
        const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
        const embeddings = new GoogleGenerativeAIEmbeddings({ 
            modelName: AI.GEMINI_EMBEDDING_MODEL,
            apiKey: process.env.GOOGLE_API_KEY
        });
        
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
        
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id,
        });

        results = await vectorStore.similaritySearch(message, 4);
        console.log("[Chat] Vector search successful, found", results.length, "results");
    } catch (embedErr: any) {
        console.error("[Chat] Vector search failed:", embedErr.message);
        // Fallback: provide document summary and metadata as context
        isContextFallback = true;
        results = [{
            pageContent: `Document Summary: ${file.summary || "No summary available"}\nMetadata: ${JSON.stringify(file.metadata || {})}`
        }];
    }

    // Context construction
    const prevMessages = await db.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
        content: msg.text,
    }));

    let responseStream: any;
    let providerUsed: "openai" | "groq" | "gemini" = AI.DEFAULT_PROVIDER;

    const messages = [
        {
            role: "system",
            content: `You are an AI assistant helping a user with their PDF document named "${file.name}". 
Use the provided context to answer the user's question. 
If the context is just a summary, inform the user that detailed search is currently limited, but you can discuss the overall document.
Answer in markdown format.`,
        },
        {
            role: "user",
            content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        \n----------------\n
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
            if (message.role === "user") return `User: ${message.content}\n`;
            return `Assistant: ${message.content}\n`;
        }).join("")}
        
        \n----------------\n
        CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}
        
        USER INPUT: ${message}`,
        },
    ];

    try {
        console.log(`[Chat] Attempting ${providerUsed} chat completion`);
        if (providerUsed === "gemini") {
            const { geminiModel } = await import("@/lib/gemini");
            // Gemini expects a different message format
            const chat = geminiModel.startChat({
                history: formattedPrevMessages.map(m => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.content }],
                })),
            });
            const result = await chat.sendMessageStream(
                `Context: ${results.map((r) => r.pageContent).join("\n\n")}\n\nUser Input: ${message}`
            );
            responseStream = result.stream;
        } else if (providerUsed === "groq") {
            const { groq } = await import("@/lib/groq");
            responseStream = await groq.chat.completions.create({
                model: AI.GROQ_MODEL,
                temperature: 0,
                stream: true,
                messages: messages as any,
            });
        } else {
            responseStream = await openai.chat.completions.create({
                model: AI.OPENAI_MODEL,
                temperature: 0,
                stream: true,
                messages: messages as any,
            });
        }
    } catch (primaryErr: any) {
        console.warn(`[Chat] ${providerUsed} failed, falling back to Groq:`, primaryErr.message);
        providerUsed = "groq";
        const { groq } = await import("@/lib/groq");
        responseStream = await groq.chat.completions.create({
            model: AI.GROQ_MODEL,
            temperature: 0,
            stream: true,
            messages: messages as any,
        });
    }

    // Create a ReadableStream from the provider's stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullText = "";
        
        try {
            if (providerUsed === "gemini") {
                for await (const chunk of responseStream) {
                    const text = chunk.text();
                    if (text) {
                        fullText += text;
                        controller.enqueue(encoder.encode(text));
                    }
                }
            } else {
                for await (const chunk of responseStream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        fullText += text;
                        controller.enqueue(encoder.encode(text));
                    }
                }
            }
            
            // Save to DB on completion
            await db.message.create({
                data: {
                    text: fullText,
                    isUserMessage: false,
                    fileId,
                    userId: user.id,
                    conversationId: conversation!.id,
                },
            });
            
            controller.close();
        } catch (e) {
            controller.error(e);
        }
      },
    });

    return new NextResponse(stream);

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}