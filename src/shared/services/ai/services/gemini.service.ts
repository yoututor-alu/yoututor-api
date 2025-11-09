import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { config } from "../../../../config";

const api = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/models"
});

@Injectable()
export class GeminiService {
  public readonly model = "gemini-2.0-flash"; // confirm exact model name from ListModels

  async generate(prompt: string): Promise<string> {
    try {
      const path = `/${this.model}:generateContent?key=${config.google.apiKey}`;
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      };

      const response = await api.post(path, body);

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      return text || "";
    } catch (error: any) {
      console.log({ GEMINI_ERROR: error?.response?.data || error });

      throw new InternalServerErrorException(
        "Gemini API error: " + error.message
      );
    }
  }
}
