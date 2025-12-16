import { openai } from "@/lib/openai";
import { groq } from "@/lib/groq";
import { ChatCompletionCreateParams } from "openai/resources/chat/completions";

export interface LLMClient {
  createChatCompletion(
    params: ChatCompletionCreateParams
  ): Promise<any>;
}

export class OpenAIClient implements LLMClient {
  async createChatCompletion(
    params: ChatCompletionCreateParams
  ): Promise<any> {
    return openai.chat.completions.create(params);
  }
}

export class GroqClient implements LLMClient {
  async createChatCompletion(
    params: ChatCompletionCreateParams
  ): Promise<any> {
    return groq.chat.completions.create(params as any);
  }
}

export const getLlmClient = (provider: "openai" | "groq"): LLMClient => {
  if (provider === "groq") {
    return new GroqClient();
  }
  return new OpenAIClient();
};
