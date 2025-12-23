import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

if (!env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

export const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});
