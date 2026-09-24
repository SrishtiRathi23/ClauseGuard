export type FileType = "pdf" | "docx" | "txt";

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface NormalizedDocument {
  id: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  rawText: string;
  pages?: DocumentPage[];
  extractedAt: string;
}
