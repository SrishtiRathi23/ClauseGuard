import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";

// Ensure we don't crash if the API key is missing, handle gracefully at runtime.
const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

let ai: GoogleGenAI | null = null;

export function getGeminiClient() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateStructuredAnalysis(prompt: string): Promise<string> {
  const client = getGeminiClient();

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).status === 429 || (error as any).message?.toLowerCase().includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error("GEMINI_API_FAILURE");
  }
}
