import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

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

  const input = await prompt.format({
    text: text.slice(0, 10000),
  });

  const response = await model.invoke(input);

  try {
    return JSON.parse(response.content as string);
  } catch (error) {
    console.warn("[upload] Failed to parse entities JSON:", error);
    return {
      people: [],
      organizations: [],
      dates: [],
      locations: [],
      key_terms: [],
    };
  }
}
