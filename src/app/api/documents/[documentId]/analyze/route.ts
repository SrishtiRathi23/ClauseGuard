import { NextRequest, NextResponse } from "next/server";
import { getDocument, isValidDocumentId } from "@/lib/documents/storage";
import { getAnalysis, saveAnalysis } from "@/lib/documents/storage";
import { analyzeDocument } from "@/lib/ai/analyze-document";

export const maxDuration = 60; // Allow 60s for Gemini structured output

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  let stage: "storage" | "analysis" | "save" = "storage";
  try {
    const { documentId } = await params;

    if (!documentId || !isValidDocumentId(documentId)) {
      return NextResponse.json({ error: "INVALID_DOCUMENT_ID" }, { status: 400 });
    }

    // 1. Check if analysis already exists (prevent duplicate Gemini calls)
    const existingAnalysis = await getAnalysis(documentId);
    if (existingAnalysis) {
      return NextResponse.json(existingAnalysis);
    }

    // 2. Load the document
    const doc = await getDocument(documentId);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 3. Call Gemini pipeline
    stage = "analysis";
    const analysis = await analyzeDocument(doc);

    // 4. Store analysis
    stage = "save";
    await saveAnalysis(documentId, analysis);

    // 5. Return success
    return NextResponse.json(analysis);

  } catch (error: unknown) {
    console.error(`Analysis ${stage} error:`, error instanceof Error ? error.message : "Unknown error");
    if (error instanceof Error) {
      if (error.message === "GEMINI_API_KEY_MISSING") {
        return NextResponse.json({ error: "CONFIGURATION_ERROR" }, { status: 500 });
      }
      if (error.message === "QUOTA_EXCEEDED") {
        return NextResponse.json({ error: "QUOTA_EXCEEDED" }, { status: 429 });
      }
      if (error.message.startsWith("GEMINI_REQUEST_REJECTED_") || error.message === "GEMINI_MODEL_NOT_FOUND" || error.message === "GEMINI_API_FAILURE") {
        return NextResponse.json({ error: error.message }, { status: 502 });
      }
      if (error.message === "Model produced invalid output.") {
        return NextResponse.json({ error: "INVALID_AI_OUTPUT" }, { status: 502 });
      }
    }

    return NextResponse.json({ error: stage === "save" ? "ANALYSIS_STORAGE_FAILED" : "ANALYSIS_FAILED" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    if (!documentId || !isValidDocumentId(documentId)) {
      return NextResponse.json({ error: "INVALID_DOCUMENT_ID" }, { status: 400 });
    }

    const analysis = await getAnalysis(documentId);

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
