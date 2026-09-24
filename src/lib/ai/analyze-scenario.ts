import { NormalizedDocument } from "../documents/types";
import { SCENARIO_ANALYSIS_PROMPT } from "./prompts";
import { generateStructuredAnalysis } from "./gemini";
import { ScenarioAnalysisSchema, ScenarioAnalysis, DocumentAnalysis } from "./schemas";

/**
 * Validates that quotes returned by the AI actually exist in the raw document text.
 * Strips out hallucinated quotes.
 */
function validateScenarioQuotes(scenarioResult: ScenarioAnalysis, rawText: string) {
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

  scenarioResult.triggeringConditions.forEach((c) => checkQuote(c.source));
  scenarioResult.relevantClauses.forEach((c) => checkQuote(c.source));
  scenarioResult.obligations.forEach((o) => checkQuote(o.source));
  scenarioResult.consequences.forEach((c) => checkQuote(c.source));

  return scenarioResult;
}

export async function analyzeScenario(
  doc: NormalizedDocument,
  existingAnalysis: DocumentAnalysis,
  userScenario: string
): Promise<ScenarioAnalysis> {

  let documentText = "";
  if (doc.pages && doc.pages.length > 0) {
    documentText = doc.pages
      .map((p) => `[PAGE ${p.pageNumber}]\n${p.text}\n`)
      .join("\n");
  } else {
    documentText = doc.rawText;
  }

  const existingAnalysisJson = JSON.stringify(existingAnalysis, null, 2);

  let prompt = SCENARIO_ANALYSIS_PROMPT.replace("{DOCUMENT_TEXT}", documentText);
  prompt = prompt.replace("{EXISTING_ANALYSIS}", existingAnalysisJson);
  prompt = prompt.replace("{USER_SCENARIO}", userScenario);

  const rawJsonResponse = await generateStructuredAnalysis(prompt);

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJsonResponse);
  } catch {
    const cleaned = rawJsonResponse.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    parsedJson = JSON.parse(cleaned);
  }

  let scenarioResult;
  try {
    scenarioResult = ScenarioAnalysisSchema.parse(parsedJson);
  } catch (zodError) {
    console.error("ZOD_VALIDATION_ERROR: The model produced JSON that didn't match the Scenario schema.");
    if (zodError instanceof Error) console.error("Validation error:", zodError.message);
    throw new Error("Model produced invalid output.");
  }

  const validatedResult = validateScenarioQuotes(scenarioResult, doc.rawText);

  return validatedResult;
}
