import { DocumentPage } from "@/lib/documents/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef } from "react";

interface ExtractedTextViewerProps {
  pages: DocumentPage[];
  isOpen: boolean;
  onToggle: () => void;
  targetPage?: number | null;
}

export function ExtractedTextViewer({ pages, isOpen, onToggle, targetPage }: ExtractedTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to target page when it changes and viewer is open
  useEffect(() => {
    if (isOpen && targetPage && containerRef.current) {
      const pageElement = containerRef.current.querySelector(`[data-page="${targetPage}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [isOpen, targetPage]);

  return (
    <div className="border-t border-cg-border pt-8 mt-16 mb-16">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-[13px] font-medium text-cg-muted hover:text-cg-dark transition-colors mx-auto"
      >
        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        {isOpen ? "Hide extracted text" : "View extracted text"}
      </button>

      {isOpen && (
        <div className="mt-6 bg-white border border-cg-border rounded-lg shadow-sm overflow-hidden" ref={containerRef}>
          <div className="bg-cg-background px-4 py-3 border-b border-cg-border flex items-center justify-between sticky top-0">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cg-muted">
              Extracted Text Viewer
            </span>
            <span className="text-[11px] font-medium text-cg-muted">
              {pages.length} Pages
            </span>
          </div>
          <div className="p-6 sm:p-8 max-h-[600px] overflow-y-auto space-y-12">
            {pages.map((page) => (
              <div key={page.pageNumber} data-page={page.pageNumber}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-cg-green/50">
                    Page {page.pageNumber}
                  </span>
                  <div className="h-px flex-1 bg-cg-border/50" />
                </div>
                <pre className="text-[13.5px] font-sans text-cg-dark whitespace-pre-wrap leading-relaxed max-w-none">
                  {page.text}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
