import { NextResponse } from "next/server";
import { getDocument, getAnalysis, isValidDocumentId } from "@/lib/documents/storage";
import { generateProfessionalQuestions } from "@/lib/ai/analyze-questions";
import { DocumentAnalysisSchema } from "@/lib/ai/schemas";

const MAX_FOCUS_LENGTH = 200;

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
    const { focus } = body;

    // Validate focus input length
    const safeFocus = (typeof focus === "string" && focus.trim().length > 0)
      ? focus.trim().slice(0, MAX_FOCUS_LENGTH)
      : "general";

    // Fetch independent private Blob records together to reduce response time.
    const [doc, storedAnalysis] = await Promise.all([
      getDocument(documentId),
      getAnalysis(documentId),
    ]);
    if (!doc) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Use server-side analysis instead of trusting client-provided analysis.
    if (!storedAnalysis) {
      return NextResponse.json({ error: "ANALYSIS_NOT_FOUND" }, { status: 404 });
    }

    const parsedAnalysis = DocumentAnalysisSchema.safeParse(storedAnalysis);
    if (!parsedAnalysis.success) {
      return NextResponse.json({ error: "ANALYSIS_INVALID" }, { status: 500 });
    }

    const result = await generateProfessionalQuestions(doc, parsedAnalysis.data, safeFocus);

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
