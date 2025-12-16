import { ChatOpenAI } from "@langchain/openai";

export async function summarizeDocument(text: string): Promise<string> {
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.3,
  });

  const prompt = `Provide a comprehensive 3-4 sentence summary of this document. Focus on the main purpose, key topics, and primary conclusions or recommendations.

Document:
${text.slice(0, 15000)}

Summary:`;

  const response = await model.invoke(prompt);

  return (response.content as string) ?? "";
}
