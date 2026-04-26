import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";
import { AI } from "@/config/ai";
import { env } from "@/lib/env";
import { messageSchema, validateRequest } from "@/lib/validation";
import { checkRateLimit } from "@/lib/security";
import { loggers } from "@/lib/logger";

export async function POST(req: NextRequest) {
    loggers.chat.info("API called with Gemini 3");

    if (!env.GOOGLE_API_KEY || env.GOOGLE_API_KEY === "") {
        loggers.chat.error("GOOGLE_API_KEY is missing in env");
        return new NextResponse(
            JSON.stringify({ error: "AI provider not configured." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const rawBody = await req.json();
        const validated = validateRequest(messageSchema)(rawBody);
        if (!validated.success) {
            return new NextResponse(
                JSON.stringify({ error: "Invalid request body", details: validated.error }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const { fileId, message } = validated.data;

        const user = await getCurrentUser();
        if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });

        const rate = await checkRateLimit(user.id, "MESSAGE");
        if (!rate.allowed) {
            return new NextResponse(
                JSON.stringify({ error: "Too many messages, please slow down." }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": Math.max(1, Math.ceil((rate.resetTime - Date.now()) / 1000)).toString(),
                        "X-RateLimit-Remaining": rate.remaining.toString(),
                        "X-RateLimit-Reset": Math.floor(rate.resetTime / 1000).toString(),
                    },
                }
            );
        }

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
        type RetrievedChunk = { pageContent: string };
        let results: RetrievedChunk[] = [];
        try {
            const { getGeminiEmbeddings } = await import("@/lib/gemini");
            const embeddings = await getGeminiEmbeddings();
            const pinecone = await getPineconeClient();
            const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: pinecone.index(PINECONE_INDEX_NAME),
                namespace: file.id,
            });
            const docs = await vectorStore.similaritySearch(message, 4);
            results = docs.map((d) => ({ pageContent: d.pageContent }));
        } catch (e: unknown) {
            const reason = e instanceof Error ? e.message : "unknown";
            loggers.chat.warn("Context fallback active", { reason });
            results = [{ pageContent: file.summary || "No document context available." }];
        }

        // Context construction
        const prevMessages = await db.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "asc" },
            take: 6,
        });

        // Provider streams have different chunk shapes; this union narrows at use.
        type GeminiChunk = { text: () => string };
        type CompletionChunk = { choices?: Array<{ delta?: { content?: string | null } }> };
        type ProviderChunk = GeminiChunk | CompletionChunk;
        let responseStream: AsyncIterable<ProviderChunk> | undefined;
        let providerUsed: "openai" | "groq" | "gemini" = AI.DEFAULT_PROVIDER;

        try {
            loggers.chat.info("Attempting provider", { provider: providerUsed });
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
                responseStream = result.stream as AsyncIterable<ProviderChunk>;
            } else {
                const { groq } = await import("@/lib/groq");
                responseStream = (await groq.chat.completions.create({
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
                    ],
                })) as unknown as AsyncIterable<ProviderChunk>;
            }
        } catch (primaryErr: unknown) {
            const primaryReason = primaryErr instanceof Error ? primaryErr.message : "unknown";
            loggers.chat.error("Primary provider failed; falling back", {
                provider: providerUsed,
                reason: primaryReason,
            });

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
                    ],
                });
                responseStream = result as unknown as AsyncIterable<ProviderChunk>;
            } else {
                const { openai } = await import("@/lib/openai");
                responseStream = (await openai.chat.completions.create({
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
                    ],
                })) as unknown as AsyncIterable<ProviderChunk>;
            }
        }

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullText = "";
                try {
                    loggers.chat.debug("Stream starting");
                    if (!responseStream) {
                        throw new Error("No response stream initialized");
                    }
                    for await (const chunk of responseStream) {
                        let text = "";
                        if (providerUsed === "gemini") {
                            text = (chunk as GeminiChunk).text();
                        } else {
                            text = (chunk as CompletionChunk).choices?.[0]?.delta?.content || "";
                        }

                        if (text) {
                            fullText += text;
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    loggers.chat.debug("Stream complete, saving message to DB");
                    await db.message.create({
                        data: { text: fullText, isUserMessage: false, fileId, userId: user.id, conversationId: conversation!.id },
                    });
                    controller.close();
                } catch (e: unknown) {
                    const reason = e instanceof Error ? e.message : "unknown";
                    loggers.chat.error("Stream reading error", { reason });
                    controller.error(e);
                }
            },
        });

        return new NextResponse(stream);

    } catch (error: unknown) {
        // Log full detail server-side; never echo provider/internal errors back
        // to the client (they can leak stack traces, paths, model names, env state).
        loggers.chat.error("Fatal error", error);
        return new NextResponse(
            JSON.stringify({ error: "Something went wrong while processing your message." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}