import { cn } from "@/lib/utils";

interface SourceCitationProps {
  source?: {
    page?: number | null;
    textQuote?: string | null;
    clauseId?: string | null;
  } | null;
  onSourceClick?: (page: number) => void;
}

export function SourceCitation({ source, onSourceClick }: SourceCitationProps) {
  if (!source || (!source.page && !source.textQuote)) return null;

  return (
    <div className="mt-4 pt-3 border-t border-cg-border/50 text-[11px] text-cg-muted">
      <div className="flex items-center gap-2 mb-1.5">
        <svg className="size-3.5 text-cg-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold uppercase tracking-wider text-cg-dark">Source from uploaded document</span>
        {source.page && (
          <button
            onClick={() => onSourceClick && onSourceClick(source.page!)}
            className={cn(
              "ml-1 px-1.5 py-0.5 rounded border border-cg-border transition-colors",
              onSourceClick ? "bg-white hover:bg-cg-green/10 cursor-pointer text-cg-green font-medium" : "bg-cg-background cursor-default"
            )}
          >
            Page {source.page}
          </button>
        )}
      </div>
      {source.textQuote && (
        <p className="pl-5 italic border-l-2 border-cg-green/20 ml-[7px] py-0.5 text-cg-muted/80">
          &quot;{source.textQuote}&quot;
        </p>
      )}
    </div>
  );
}
