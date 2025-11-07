import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { config } from "../../../../config";

const api = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/models"
});

@Injectable()
export class GeminiService {
  public readonly model = "gemini-1.5-flash";

  async generate(prompt: string): Promise<string> {
    try {
      const response = await api.post(
        `/${this.model}:generateContent?key=${config.gemini.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      // Gemini returns candidates[0].content.parts[0].text
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error: any) {
      console.log({ GEMINI_ERROR: error?.response?.data || error });

      throw new InternalServerErrorException(
        "Gemini API error: " + error.message
      );
    }
  }
}
