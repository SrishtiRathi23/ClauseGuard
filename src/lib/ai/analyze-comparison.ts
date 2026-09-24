import { NormalizedDocument } from "../documents/types";
import { COMPARISON_ANALYSIS_PROMPT } from "./prompts";
import { generateStructuredAnalysis } from "./gemini";
import { ComparisonAnalysisSchema, ComparisonAnalysis } from "./schemas";

function validateComparisonQuotes(comparisonResult: ComparisonAnalysis, docARawText: string, docBRawText: string) {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedDocA = normalize(docARawText);
  const normalizedDocB = normalize(docBRawText);

  comparisonResult.changes.forEach((change) => {
    if (change.documentA?.source?.textQuote) {
      if (!normalizedDocA.includes(normalize(change.documentA.source.textQuote))) {
        delete change.documentA.source.textQuote;
      }
    }
    if (change.documentB?.source?.textQuote) {
      if (!normalizedDocB.includes(normalize(change.documentB.source.textQuote))) {
        delete change.documentB.source.textQuote;
      }
    }
  });

  return comparisonResult;
}

export async function analyzeComparison(docA: NormalizedDocument, docB: NormalizedDocument): Promise<ComparisonAnalysis> {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

  if (normalize(docA.rawText) === normalize(docB.rawText)) {
    return {
      documentA: { filename: docA.fileName || "Document A", title: "Document A" },
      documentB: { filename: docB.fileName || "Document B", title: "Document B" },
      summary: "No textual differences were found. The documents are identical.",
      isIdentical: true,
      changes: [],
      unchangedAreas: ["Entire document"],
      missingInformation: [],
      professionalQuestions: []
    };
  }

  let textA = "";
  if (docA.pages && docA.pages.length > 0) {
    textA = docA.pages.map((p) => `[PAGE ${p.pageNumber}]\n${p.text}\n`).join("\n");
  } else {
    textA = docA.rawText;
  }

  let textB = "";
  if (docB.pages && docB.pages.length > 0) {
    textB = docB.pages.map((p) => `[PAGE ${p.pageNumber}]\n${p.text}\n`).join("\n");
  } else {
    textB = docB.rawText;
  }

  let prompt = COMPARISON_ANALYSIS_PROMPT.replace("{DOCUMENT_A_TEXT}", textA);
  prompt = prompt.replace("{DOCUMENT_B_TEXT}", textB);

  const rawJsonResponse = await generateStructuredAnalysis(prompt);

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJsonResponse);
  } catch {
    const cleaned = rawJsonResponse.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    parsedJson = JSON.parse(cleaned);
  }

  let comparisonResult;
  try {
    comparisonResult = ComparisonAnalysisSchema.parse(parsedJson);
  } catch (zodError) {
    console.error("ZOD_VALIDATION_ERROR: The model produced JSON that didn't match the Comparison schema.");
    if (zodError instanceof Error) console.error("Validation error:", zodError.message);
    throw new Error("Model produced invalid output.");
  }

  // Ensure filenames are correctly attributed regardless of AI whims
  comparisonResult.documentA.filename = docA.fileName || "Document A";
  comparisonResult.documentB.filename = docB.fileName || "Document B";

  const validatedResult = validateComparisonQuotes(comparisonResult, docA.rawText, docB.rawText);

  return validatedResult;
}
