import mammoth from "mammoth";
import { DocumentPage, FileType, NormalizedDocument } from "./types";

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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParser = require("pdf2json");

      rawText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
          resolve(pdfParser.getRawTextContent());
        });

        pdfParser.parseBuffer(fileBuffer);
      });

      // pdf2json separates pages with lines like "----------------Page (0) Break----------------"
      const splitPages = rawText.split(/----------------Page \(\d+\) Break----------------/).map(t => t.trim()).filter(t => t.length > 0);

      if (splitPages.length > 0) {
        pages = splitPages.map((text, index) => ({
          pageNumber: index + 1,
          text: text,
        }));
      } else {
        pages = [{ pageNumber: 1, text: rawText.trim() }];
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
    throw new Error(error instanceof Error && error.message === "EMPTY_DOCUMENT" ? "EMPTY_DOCUMENT" : "EXTRACTION_FAILED");
  }
}
