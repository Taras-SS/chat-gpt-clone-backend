import { OpenAI } from "openai";

let openAIInstance = null;
export const getCachedOpenAI = () => {
  if (openAIInstance) {
    return openAIInstance;
  }

  openAIInstance = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  return openAIInstance;
};
