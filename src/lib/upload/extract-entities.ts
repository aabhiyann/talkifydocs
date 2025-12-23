import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { loggers } from "../logger";

export async function extractEntities(text: string) {
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
  });

  const prompt = PromptTemplate.fromTemplate(`
Extract key entities from the following document text.
Return a JSON object with these fields:
- people: array of person names
- organizations: array of organization names
- dates: array of important dates
- locations: array of locations
- key_terms: array of domain-specific terms

Document text:
{text}

Respond with only valid JSON, no additional text.
`);

  const formattedPrompt = await prompt.format({
    text: text.slice(0, 10000),
  });

  let responseContent: string;

  try {
    const { geminiModel } = await import("@/lib/gemini");
    const result = await geminiModel.generateContent(formattedPrompt);
    responseContent = result.response.text();
  } catch (geminiErr: any) {
    console.warn("Gemini entities extraction failed, falling back to Groq:", geminiErr.message);
    const { groq } = await import("@/lib/groq");
    const fallbackRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0,
    });
    responseContent = fallbackRes.choices[0]?.message?.content || "{}";
  }

  try {
    return JSON.parse(responseContent);
  } catch (error) {
    loggers.upload.warn("Failed to parse entities JSON:", error);
    return {
      people: [],
      organizations: [],
      dates: [],
      locations: [],
      key_terms: [],
    };
  }
}
