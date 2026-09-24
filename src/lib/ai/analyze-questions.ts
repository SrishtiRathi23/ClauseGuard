import { NormalizedDocument } from "../documents/types";
import { QUESTION_GENERATION_PROMPT } from "./prompts";
import { generateStructuredAnalysis } from "./gemini";
import { ProfessionalQuestionSetSchema, ProfessionalQuestionSet, DocumentAnalysis } from "./schemas";

function validateQuestionQuotes(questionSet: ProfessionalQuestionSet, rawText: string) {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedDoc = normalize(rawText);

  questionSet.questions.forEach((q) => {
    if (q.source?.textQuote) {
      const normalizedQuote = normalize(q.source.textQuote);
      if (!normalizedDoc.includes(normalizedQuote)) {
        delete q.source.textQuote;
      }
    }
  });

  return questionSet;
}

export async function generateProfessionalQuestions(
  doc: NormalizedDocument,
  existingAnalysis: DocumentAnalysis,
  focusArea: string = "general"
): Promise<ProfessionalQuestionSet> {
  let documentText = "";
  if (doc.pages && doc.pages.length > 0) {
    documentText = doc.pages
      .map((p) => `[PAGE ${p.pageNumber}]\n${p.text}\n`)
      .join("\n");
  } else {
    documentText = doc.rawText;
  }

  const existingAnalysisJson = JSON.stringify(existingAnalysis, null, 2);

  let prompt = QUESTION_GENERATION_PROMPT.replace("{DOCUMENT_TEXT}", documentText);
  prompt = prompt.replace("{EXISTING_ANALYSIS}", existingAnalysisJson);
  prompt = prompt.replace("{FOCUS_AREA}", focusArea);

  const rawJsonResponse = await generateStructuredAnalysis(prompt);

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJsonResponse);
  } catch {
    const cleaned = rawJsonResponse.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    parsedJson = JSON.parse(cleaned);
  }

  let questionSet;
  try {
    questionSet = ProfessionalQuestionSetSchema.parse(parsedJson);
  } catch (zodError) {
    console.error("ZOD_VALIDATION_ERROR: The model produced JSON that didn't match the Questions schema.");
    if (zodError instanceof Error) console.error("Validation error:", zodError.message);
    throw new Error("Model produced invalid output.");
  }

  const validatedResult = validateQuestionQuotes(questionSet, doc.rawText);

  return validatedResult;
}
