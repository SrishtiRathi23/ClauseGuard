import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
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
      const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
      try {
        const result = await extractText(pdf);
        const pageTexts = Array.isArray(result.text) ? result.text : [result.text];
        rawText = pageTexts.join("\n\n");
        pages = pageTexts.map((text, index) => ({
          pageNumber: index + 1,
          text: text.trim(),
        }));
      } finally {
        await pdf.destroy();
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
