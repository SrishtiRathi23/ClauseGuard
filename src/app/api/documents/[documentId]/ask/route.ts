import { NextResponse } from "next/server";
import { getDocument, getAnalysis, isValidDocumentId } from "@/lib/documents/storage";
import { analyzeQA } from "@/lib/ai/analyze-qa";
import { DocumentAnalysisSchema } from "@/lib/ai/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    if (!documentId || !isValidDocumentId(documentId)) {
      return NextResponse.json({ error: "INVALID_DOCUMENT_ID" }, { status: 400 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "INVALID_QUESTION" }, { status: 400 });
    }

    if (question.length > 1000) {
      return NextResponse.json({ error: "QUESTION_TOO_LONG" }, { status: 400 });
    }

    // Load document
    const doc = await getDocument(documentId);
    if (!doc) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Load server-side analysis instead of trusting client-provided analysis
    const storedAnalysis = await getAnalysis(documentId);
    if (!storedAnalysis) {
      return NextResponse.json({ error: "ANALYSIS_NOT_FOUND" }, { status: 404 });
    }

    // Validate stored analysis structure
    const parsedAnalysis = DocumentAnalysisSchema.safeParse(storedAnalysis);
    if (!parsedAnalysis.success) {
      return NextResponse.json({ error: "ANALYSIS_INVALID" }, { status: 500 });
    }

    const result = await analyzeQA(doc, parsedAnalysis.data, question.trim());

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("API_KEY_MISSING")) {
        return NextResponse.json({ error: "CONFIGURATION_ERROR" }, { status: 500 });
      }
      if (error.message === "QUOTA_EXCEEDED") {
        return NextResponse.json({ error: "QUOTA_EXCEEDED" }, { status: 429 });
      }
    }
    return NextResponse.json({ error: "ANALYSIS_FAILED" }, { status: 500 });
  }
}
