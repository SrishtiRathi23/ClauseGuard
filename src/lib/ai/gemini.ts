import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";

let ai: GoogleGenAI | null = null;
let currentApiKey = "";

export function getGeminiClient() {
  // Read at request time: Vercel provides sensitive variables to the running
  // function, and their values can differ from the build environment.
  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  if (!ai || currentApiKey !== apiKey) {
    ai = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
  }
  return ai;
}

export async function generateStructuredAnalysis(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1, // Low temperature for factual extraction
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    return response.text;
  } catch (error: unknown) {
    console.error("Gemini API Error:", error instanceof Error ? error.message : "Unknown error");
    if (error instanceof Error) {
      if (error.message?.includes("GEMINI_API_KEY_MISSING")) {
        throw error;
      }
    }
    const providerError = error as { status?: number; message?: string };
    if (providerError.status === 429 || providerError.message?.toLowerCase().includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    if (providerError.status === 400 || providerError.status === 401 || providerError.status === 403) {
      throw new Error(`GEMINI_REQUEST_REJECTED_${providerError.status}`);
    }
    if (providerError.status === 404) {
      throw new Error("GEMINI_MODEL_NOT_FOUND");
    }
    throw new Error("GEMINI_API_FAILURE");
  }
}
