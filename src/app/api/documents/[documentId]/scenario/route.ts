import { NextResponse } from "next/server";
import { getDocument, getAnalysis, isValidDocumentId } from "@/lib/documents/storage";
import { analyzeScenario } from "@/lib/ai/analyze-scenario";
import { DocumentAnalysisSchema } from "@/lib/ai/schemas";

const MAX_SCENARIO_LENGTH = 2000;

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
    const { scenario } = body;

    if (!scenario || typeof scenario !== "string" || scenario.trim().length === 0) {
      return NextResponse.json({ error: "SCENARIO_MISSING" }, { status: 400 });
    }

    if (scenario.length > MAX_SCENARIO_LENGTH) {
      return NextResponse.json({ error: "SCENARIO_TOO_LONG" }, { status: 400 });
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

    const parsedAnalysis = DocumentAnalysisSchema.safeParse(storedAnalysis);
    if (!parsedAnalysis.success) {
      return NextResponse.json({ error: "ANALYSIS_INVALID" }, { status: 500 });
    }

    const result = await analyzeScenario(doc, parsedAnalysis.data, scenario.trim());

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
