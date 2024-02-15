import { getCachedOpenAI } from "../utils/index.js";

export class OpenAIService {
  constructor() {}

  static async askQuestion(question) {
    const openAIInstance = getCachedOpenAI();
    const response = await openAIInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    });

    return response?.choices;
  }
}
