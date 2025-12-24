import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";
import { AI } from "@/config/ai";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
    console.log("[Chat] API called with Gemini 3");

    if (!env.GOOGLE_API_KEY || env.GOOGLE_API_KEY === "") {
        console.error("[Chat] GOOGLE_API_KEY is missing in env");
        return new NextResponse(JSON.stringify({ error: "Google API Key is not configured on the server." }), { status: 500 });
    }

    try {
        const body = await req.json();
        const { fileId, message } = body;

        const user = await getCurrentUser();
        if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });

        const file = await db.file.findFirst({
            where: { id: fileId, userId: user.id },
            select: { id: true, name: true, summary: true, metadata: true }
        });
        if (!file) return new NextResponse("File not found", { status: 404 });

        // Find or create conversation
        let conversation = await db.conversation.findFirst({
            where: { userId: user.id, conversationFiles: { some: { fileId } } },
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
            data: { text: message, isUserMessage: true, userId: user.id, fileId, conversationId: conversation.id },
        });

        // Vector search using Gemini Embeddings
        let results: any[] = [];
        try {
            const { getGeminiEmbeddings } = await import("@/lib/gemini");
            const embeddings = await getGeminiEmbeddings();
            const pinecone = await getPineconeClient();
            const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: pinecone.index(PINECONE_INDEX_NAME),
                namespace: file.id,
            });
            results = await vectorStore.similaritySearch(message, 4);
        } catch (e: any) {
            console.warn("[Chat] Context fallback active:", e.message);
            results = [{ pageContent: file.summary || "No document context available." }];
        }

        // Context construction
        const prevMessages = await db.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "asc" },
            take: 6,
        });

        let responseStream: any;
        let providerUsed: "openai" | "groq" | "gemini" = AI.DEFAULT_PROVIDER;

        try {
            console.log(`[Chat] Attempting ${providerUsed}`);
            if (providerUsed === "gemini") {
                const { genAI } = await import("@/lib/gemini");
                // Ensure model is initialized inside try block
                const model = genAI.getGenerativeModel({ model: AI.GEMINI_MODEL });
                const chat = model.startChat({
                    history: prevMessages.map(m => ({
                        role: m.isUserMessage ? "user" : "model",
                        parts: [{ text: m.text }],
                    })),
                });
                const contextText = results.map(r => r.pageContent).join("\n\n");
                const fullPrompt = `Document Context:\n${contextText}\n\nQuestion: ${message}`;
                const result = await chat.sendMessageStream(fullPrompt);
                responseStream = result.stream;
            } else {
                const { groq } = await import("@/lib/groq");
                responseStream = await groq.chat.completions.create({
                    model: AI.GROQ_MODEL,
                    temperature: 0,
                    stream: true,
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant helping a user with their PDF document named "${file.name}". Answer in markdown format.`,
                        },
                        {
                            role: "user",
                            content: `Context:\n${results.map(r => r.pageContent).join("\n\n")}\n\nQuestion: ${message}`,
                        },
                    ] as any,
                });
            }
        } catch (primaryErr: any) {
            console.error(`[Chat] ${providerUsed} failed (Reason: ${primaryErr.message}), falling back to Groq`);

            // If it was already Groq that failed, OpenAI is the last hope
            const fallbackProvider = providerUsed === "groq" ? "openai" : "groq";
            providerUsed = fallbackProvider;

            if (fallbackProvider === "groq") {
                const { groq } = await import("@/lib/groq");
                const result = await groq.chat.completions.create({
                    model: AI.GROQ_MODEL,
                    temperature: 0,
                    stream: true,
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant helping a user with their PDF document named "${file.name}". Answer in markdown format.`,
                        },
                        {
                            role: "user",
                            content: `Context:\n${results.map(r => r.pageContent).join("\n\n")}\n\nQuestion: ${message}`,
                        },
                    ] as any,
                });
                responseStream = result;
            } else {
                const { openai } = await import("@/lib/openai");
                responseStream = await openai.chat.completions.create({
                    model: AI.OPENAI_MODEL,
                    temperature: 0,
                    stream: true,
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant helping a user with their PDF document named "${file.name}". Answer in markdown format.`,
                        },
                        {
                            role: "user",
                            content: `Context:\n${results.map(r => r.pageContent).join("\n\n")}\n\nQuestion: ${message}`,
                        },
                    ] as any,
                });
            }
        }

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullText = "";
                try {
                    console.log("[Chat] Stream starting...");
                    for await (const chunk of responseStream) {
                        let text = "";
                        if (providerUsed === "gemini") {
                            text = chunk.text();
                        } else {
                            text = chunk.choices?.[0]?.delta?.content || "";
                        }

                        if (text) {
                            fullText += text;
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    console.log("[Chat] Stream complete, saving message to DB");
                    await db.message.create({
                        data: { text: fullText, isUserMessage: false, fileId, userId: user.id, conversationId: conversation!.id },
                    });
                    controller.close();
                } catch (e: any) {
                    console.error("[Chat] Stream reading error:", e.message);
                    controller.error(e);
                }
            },
        });

        return new NextResponse(stream);

    } catch (error: any) {
        console.error("[Chat] Fatal error:", error);
        const detail = error.message || "Unknown internal error";
        return new NextResponse(JSON.stringify({ error: detail }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}