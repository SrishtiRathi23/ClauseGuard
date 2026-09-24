import { NextRequest, NextResponse } from "next/server";
import { extractDocument } from "@/lib/documents/extract";
import { saveDocument } from "@/lib/documents/storage";
import { FileType } from "@/lib/documents/types";

export const maxDuration = 30; // Support longer processing for PDFs

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "EMPTY_DOCUMENT" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    let fileType: FileType;

    if (extension === "pdf" || file.type === "application/pdf") {
      fileType = "pdf";
    } else if (
      extension === "docx" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      fileType = "docx";
    } else if (extension === "txt" || file.type === "text/plain") {
      fileType = "txt";
    } else {
      return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename: strip path components and control characters (used only as display metadata)
    const sanitizedName = file.name
      .replace(/^.*[\\/]/, "")                // Remove path components
      .replace(/[<>:"|?*\x00-\x1F]/g, "_")   // Replace unsafe characters
      .slice(0, 255);                         // Limit length

    // Extract text and normalize
    const normalizedDoc = await extractDocument(buffer, sanitizedName, fileType, file.size);

    // Add the prefix for unique ID
    normalizedDoc.id = `doc_${normalizedDoc.id}`;

    // Save to local storage
    await saveDocument(normalizedDoc);

    // Return only metadata (no raw text to keep payload small)
    return NextResponse.json({
      documentId: normalizedDoc.id,
      fileName: normalizedDoc.fileName,
      fileType: normalizedDoc.fileType,
      fileSize: normalizedDoc.fileSize,
      pageCount: normalizedDoc.pages?.length || 0,
      textLength: normalizedDoc.rawText.length,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error instanceof Error ? error.message : "Unknown error");

    if (error instanceof Error) {
      if (error.message === "EMPTY_DOCUMENT" || error.message === "EXTRACTION_FAILED") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
