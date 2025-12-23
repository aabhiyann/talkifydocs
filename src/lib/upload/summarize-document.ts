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

  try {
    const { geminiModel } = await import("@/lib/gemini");
    const result = await geminiModel.generateContent(prompt);
    return result.response.text() ?? "";
  } catch (geminiErr: any) {
    console.warn("Gemini summarization failed, falling back to Groq:", geminiErr.message);
    const { groq } = await import("@/lib/groq");
    const fallbackRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
    });
    return fallbackRes.choices[0]?.message?.content || "Summary generation failed.";
  }
}
