import { NextResponse } from "next/server";
import { getDocument, isValidDocumentId } from "@/lib/documents/storage";
import { analyzeComparison } from "@/lib/ai/analyze-comparison";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentAId, documentBId } = body;

    if (!documentAId || !documentBId) {
      return NextResponse.json({ error: "MISSING_DOCUMENTS" }, { status: 400 });
    }

    if (!isValidDocumentId(documentAId) || !isValidDocumentId(documentBId)) {
      return NextResponse.json({ error: "INVALID_DOCUMENT_ID" }, { status: 400 });
    }

    const docA = await getDocument(documentAId);
    const docB = await getDocument(documentBId);

    if (!docA || !docB) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const result = await analyzeComparison(docA, docB);

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
