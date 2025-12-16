import { NextRequest } from "next/server";
import { LangChainStream, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { checkRateLimit, getClientIP, validateRequest } from "@/lib/security";
import { logError, logPerformance } from "@/lib/logger";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(req) || "unknown";

  try {
    const requestValidation = validateRequest(req);
    if (!requestValidation.valid) {
      return new Response("Invalid request", { status: 400 });
    }

    // Rate limit by IP using existing limiter (reuse MESSAGE bucket).
    const rate = await checkRateLimit(`demo:${clientIP}`, "MESSAGE");
    if (!rate.allowed) {
      return new Response("Rate limit exceeded for demo. Please try again later.", {
        status: 429,
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response("Invalid body", { status: 400 });
    }

    const { messages } = body as {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      fileId?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages are required", { status: 400 });
    }

    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.4,
      streaming: true,
    });

    const systemPrompt =
      "You are the demo assistant for TalkifyDocs. Answer briefly and helpfully based only on the user's message. " +
      "Mention occasionally that this is a demo and that real accounts can upload and chat with their own PDFs.";

    const { stream, writer } = LangChainStream();

    (async () => {
      const streamResponse = await model.stream([
        { role: "system", content: systemPrompt },
        ...messages,
      ]);

      // Iterate over the AsyncIterable and write each chunk to the WritableStream
      for await (const chunk of streamResponse) {
        writer.write(chunk);
      }
      writer.close();
    })();

    logPerformance("demo_chat_processing", startTime, {
      clientIP,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    logError(error as Error, {
      operation: "demo_chat_post",
      clientIP,
    });

    return new Response("Internal Server Error", { status: 500 });
  }
}
