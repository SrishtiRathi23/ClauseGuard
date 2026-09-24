import { NormalizedDocument } from "../documents/types";
import { DOCUMENT_QA_PROMPT } from "./prompts";
import { generateStructuredAnalysis } from "./gemini";
import { DocumentQAResponseSchema, DocumentQAResponse, DocumentAnalysis } from "./schemas";

function validateQASources(qaResponse: DocumentQAResponse, rawText: string) {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedDoc = normalize(rawText);

  // Validate and keep only valid sources
  qaResponse.sources = qaResponse.sources.filter((source) => {
    if (source.textQuote) {
      const normalizedQuote = normalize(source.textQuote);
      if (normalizedDoc.includes(normalizedQuote)) {
        return true;
      }
      return false; // strip hallucinated quotes
    }
    return false; // strip sources without quotes
  });

  return qaResponse;
}

export async function analyzeQA(
  doc: NormalizedDocument,
  existingAnalysis: DocumentAnalysis,
  question: string
): Promise<DocumentQAResponse> {
  let documentText = "";
  if (doc.pages && doc.pages.length > 0) {
    documentText = doc.pages
      .map((p) => `[PAGE ${p.pageNumber}]\n${p.text}\n`)
      .join("\n");
  } else {
    documentText = doc.rawText;
  }

  const existingAnalysisJson = JSON.stringify(existingAnalysis, null, 2);

  let prompt = DOCUMENT_QA_PROMPT.replace("{DOCUMENT_TEXT}", documentText);
  prompt = prompt.replace("{EXISTING_ANALYSIS}", existingAnalysisJson);
  prompt = prompt.replace("{USER_QUESTION}", question);

  const rawJsonResponse = await generateStructuredAnalysis(prompt);

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJsonResponse);
  } catch {
    const cleaned = rawJsonResponse.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    parsedJson = JSON.parse(cleaned);
  }

  let qaResponse;
  try {
    qaResponse = DocumentQAResponseSchema.parse(parsedJson);
  } catch (zodError) {
    console.error("ZOD_VALIDATION_ERROR: The model produced JSON that didn't match the QA schema.");
    if (zodError instanceof Error) console.error("Validation error:", zodError.message);
    throw new Error("Model produced invalid output.");
  }

  const validatedResult = validateQASources(qaResponse, doc.rawText);

  return validatedResult;
}
