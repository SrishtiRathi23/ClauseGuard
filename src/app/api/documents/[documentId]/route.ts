import { NextRequest, NextResponse } from "next/server";
import { getDocument, isValidDocumentId } from "@/lib/documents/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    if (!documentId || !isValidDocumentId(documentId)) {
      return NextResponse.json({ error: "INVALID_DOCUMENT_ID" }, { status: 400 });
    }

    const doc = await getDocument(documentId);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
