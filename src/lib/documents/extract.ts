import mammoth from "mammoth";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { DocumentPage, FileType, NormalizedDocument } from "./types";

const MAX_EXTRACTED_TEXT_LENGTH = 100_000;

export async function extractDocument(
  fileBuffer: Buffer,
  fileName: string,
  fileType: FileType,
  fileSize: number
): Promise<NormalizedDocument> {
  let rawText = "";
  let pages: DocumentPage[] = [];

  try {
    if (fileType === "pdf") {
      const parser = new PDFParse({ data: fileBuffer });
      try {
        const result = await parser.getText();
        rawText = result.text;
        pages = result.pages.map((page, index) => ({
          pageNumber: page.num || index + 1,
          text: page.text.trim(),
        }));
      } finally {
        await parser.destroy();
      }

    } else if (fileType === "docx") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = result.value;

      // For DOCX, we don't have true pages, so we split by major paragraphs roughly to mimic chunks
      const paragraphs = rawText.split("\n\n").map(t => t.trim()).filter(t => t.length > 0);
      pages = paragraphs.map((text, index) => ({
        pageNumber: index + 1,
        text: text,
      }));

    } else if (fileType === "txt") {
      rawText = fileBuffer.toString("utf-8");
      // For TXT, just keep it as one page or split by double newlines like docx
      const paragraphs = rawText.split("\n\n").map(t => t.trim()).filter(t => t.length > 0);
      pages = paragraphs.map((text, index) => ({
        pageNumber: index + 1,
        text: text,
      }));
    } else {
      throw new Error("Unsupported file type");
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("EMPTY_DOCUMENT");
    }

    if (rawText.length > MAX_EXTRACTED_TEXT_LENGTH) {
      throw new Error("DOCUMENT_TOO_LONG");
    }

    return {
      id: crypto.randomUUID().replace(/-/g, ""), // e.g. doc_... will be prepended outside
      fileName,
      fileType,
      fileSize,
      rawText: rawText.trim(),
      pages,
      extractedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Extraction error:", error instanceof Error ? error.message : "Unknown error");
    if (error instanceof Error && ["EMPTY_DOCUMENT", "DOCUMENT_TOO_LONG"].includes(error.message)) {
      throw error;
    }
    throw new Error("EXTRACTION_FAILED");
  }
}
