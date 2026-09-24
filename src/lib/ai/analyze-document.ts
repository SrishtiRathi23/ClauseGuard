import { NormalizedDocument } from "../documents/types";
import { DOCUMENT_ANALYSIS_PROMPT } from "./prompts";
import { generateStructuredAnalysis } from "./gemini";
import { DocumentAnalysisSchema, DocumentAnalysis } from "./schemas";

/**
 * Validates that quotes returned by the AI actually exist in the raw document text.
 * Strips out hallucinated quotes.
 */
function validateSourceQuotes(analysis: DocumentAnalysis, rawText: string) {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedDoc = normalize(rawText);

  const checkQuote = (source?: { textQuote?: string | null } | null) => {
    if (source && source.textQuote) {
      const normalizedQuote = normalize(source.textQuote);
      if (!normalizedDoc.includes(normalizedQuote)) {
        // Quote hallucinated or heavily mutated by AI, remove it.
        delete source.textQuote;
      }
    }
  };

  analysis.clauses.forEach((c) => checkQuote(c.source));
  analysis.obligations.forEach((o) => checkQuote(o.source));
  analysis.deadlines.forEach((d) => checkQuote(d.source));
  analysis.attentionPoints.forEach((a) => checkQuote(a.source));

  return analysis;
}

export async function analyzeDocument(doc: NormalizedDocument): Promise<DocumentAnalysis> {
  // Reconstruct document text with page markers for Gemini to understand pagination
  let documentText = "";
  if (doc.pages && doc.pages.length > 0) {
    documentText = doc.pages
      .map((p) => `[PAGE ${p.pageNumber}]\n${p.text}\n`)
      .join("\n");
  } else {
    documentText = doc.rawText;
  }

  // Ensure we don't exceed a massive context size for flash if the document is enormous.
  // Flash has a 1M token context window, so we are generally safe for typical documents without complex chunking.
  // A chunking layer can be added here if needed, but for typical Phase 3 test docs, direct mapping is optimal.

  const prompt = DOCUMENT_ANALYSIS_PROMPT.replace("{DOCUMENT_TEXT}", documentText);

  // Call Gemini API
  const rawJsonResponse = await generateStructuredAnalysis(prompt);

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJsonResponse);
  } catch {
    // Basic repair if markdown code blocks were included
    const cleaned = rawJsonResponse.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    parsedJson = JSON.parse(cleaned);
  }

  // Validate against strict Zod schema
  let analysis;
  try {
    analysis = DocumentAnalysisSchema.parse(parsedJson);
  } catch (zodError) {
    console.error("ZOD_VALIDATION_ERROR: The model produced JSON that didn't match the schema.");
    // Log only the validation error shape, not the full response (which contains document content)
    if (zodError instanceof Error) {
      console.error("Validation error:", zodError.message);
    }
    throw new Error("Model produced invalid output.");
  }

  // Source Validation: prevent hallucinated quotes
  const validatedAnalysis = validateSourceQuotes(analysis, doc.rawText);

  return validatedAnalysis;
}
