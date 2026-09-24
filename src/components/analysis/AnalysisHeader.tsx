import { FileText, Calendar } from "lucide-react";
import { NormalizedDocument } from "@/lib/documents/types";
import { DocumentAnalysis } from "@/lib/ai/schemas";

interface AnalysisHeaderProps {
  doc: NormalizedDocument;
  analysis: DocumentAnalysis;
  onViewText: () => void;
}

export function AnalysisHeader({ doc, analysis, onViewText }: AnalysisHeaderProps) {
  const extractedDate = new Date(doc.extractedAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const fileSize = doc.fileSize < 1024 * 1024
    ? `${Math.round(doc.fileSize / 1024)} KB`
    : `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">
        <FileText className="size-3.5" />
        {analysis.documentType || "DOCUMENT"}
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-cg-dark mb-6 leading-tight">
        {analysis.title || doc.fileName}
      </h1>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-cg-muted">
        <span className="flex items-center gap-1.5">
          <span className="uppercase text-[11px] font-bold tracking-wider">{doc.fileType}</span>
          <span>·</span>
          <span>{fileSize}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          Analyzed {extractedDate}
        </span>
        <button
          onClick={onViewText}
          className="font-medium text-cg-green hover:underline"
        >
          View extracted text
        </button>
      </div>
    </div>
  );
}
