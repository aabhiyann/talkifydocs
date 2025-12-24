import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";
import { AI } from "@/config/ai";

if (!env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

export const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: AI.GEMINI_MODEL,
});

export const getGeminiEmbeddings = async () => {
  const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
  return new GoogleGenerativeAIEmbeddings({
    modelName: AI.GEMINI_EMBEDDING_MODEL,
    apiKey: env.GOOGLE_API_KEY,
  });
};
