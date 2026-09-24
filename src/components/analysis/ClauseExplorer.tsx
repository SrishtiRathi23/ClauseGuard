import { DocumentAnalysis } from "@/lib/ai/schemas";
import { useState, useMemo } from "react";
import { Search, AlertCircle, FileText } from "lucide-react";
import { SourceCitation } from "./SourceCitation";
import { cn } from "@/lib/utils";

interface ClauseExplorerProps {
  analysis: DocumentAnalysis;
  onSourceClick: (page: number) => void;
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export function ClauseExplorer({ analysis, onSourceClick, selectedClauseId, onSelectClause }: ClauseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterAttention, setFilterAttention] = useState<string>("All");

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(analysis.clauses?.map(c => c.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [analysis.clauses]);

  // Client-side filtering and searching
  const filteredClauses = useMemo(() => {
    if (!analysis.clauses) return [];

    return analysis.clauses.filter(clause => {
      // Filter by category
      if (filterCategory !== "All" && clause.category !== filterCategory) return false;

      // Filter by attention level
      if (filterAttention !== "All" && clause.attentionLevel !== filterAttention.toLowerCase()) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = clause.title?.toLowerCase().includes(query);
        const matchesExplanation = clause.plainLanguage?.toLowerCase().includes(query);
        const matchesCategory = clause.category?.toLowerCase().includes(query);
        const matchesOriginalText = clause.originalText?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesExplanation && !matchesCategory && !matchesOriginalText) return false;
      }

      return true;
    });
  }, [analysis.clauses, searchQuery, filterCategory, filterAttention]);

  const selectedClause = useMemo(() => {
    return analysis.clauses?.find(c => c.id === selectedClauseId) || null;
  }, [analysis.clauses, selectedClauseId]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">

      {/* Left Sidebar: List & Filters */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cg-muted" />
          <input
            type="text"
            placeholder="Search clauses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-cg-border rounded-lg text-[14px] text-cg-dark focus:outline-none focus:border-cg-green focus:ring-1 focus:ring-cg-green transition-all"
            aria-label="Search clauses"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-cg-border rounded-md text-[12px] font-medium text-cg-dark focus:outline-none focus:border-cg-green"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={filterAttention}
            onChange={(e) => setFilterAttention(e.target.value)}
            className="px-3 py-1.5 bg-white border border-cg-border rounded-md text-[12px] font-medium text-cg-dark focus:outline-none focus:border-cg-green"
          >
            <option value="All">All Priority</option>
            <option value="Important">Important</option>
            <option value="Review">Review</option>
            <option value="Information">Information</option>
          </select>
        </div>

        {/* Clause List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-2 pb-4">
          {filteredClauses.length > 0 ? (
            filteredClauses.map((clause) => (
              <button
                key={clause.id}
                onClick={() => onSelectClause(clause.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all duration-200",
                  selectedClauseId === clause.id
                    ? "bg-white border-cg-green shadow-sm ring-1 ring-cg-green/20"
                    : "bg-white/50 border-cg-border hover:bg-white hover:border-cg-border/80"
                )}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <h4 className="font-semibold text-[14px] text-cg-dark line-clamp-1">{clause.title}</h4>
                  {clause.attentionLevel === "important" && (
                    <AlertCircle className="size-3.5 text-cg-attention shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-cg-muted">
                  <span>{clause.category?.replace(/_/g, " ")}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 px-4 border border-dashed border-cg-border rounded-lg">
              <p className="text-[14px] text-cg-muted">No clauses match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Clause Detail */}
      <div className="w-full lg:w-2/3">
        {selectedClause ? (
          <div className="bg-white border border-cg-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 sm:px-8 py-6 border-b border-cg-border bg-cg-background/50">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">
                <FileText className="size-3.5" />
                {selectedClause.category?.replace(/_/g, " ")}
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl text-cg-dark">{selectedClause.title}</h2>

              {selectedClause.attentionLevel && selectedClause.attentionLevel !== "information" && (
                <div className={cn(
                  "mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-bold uppercase tracking-wider",
                  selectedClause.attentionLevel === "important" ? "bg-cg-attention/10 text-cg-attention" : "bg-cg-accent/10 text-cg-accent"
                )}>
                  <AlertCircle className="size-3.5" />
                  {selectedClause.attentionLevel}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-10">

              {/* Plain Language */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">What It Means</h3>
                <p className="text-[15px] text-cg-dark leading-relaxed">
                  {selectedClause.plainLanguage}
                </p>
              </section>

              {/* Original Text */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3 flex items-center gap-2">
                  Original Document Text
                  <span className="font-normal normal-case tracking-normal text-cg-muted/70 text-[12px]">(excerpt)</span>
                </h3>
                <div className="bg-cg-background px-5 py-4 rounded-lg border border-cg-border/50">
                  <p className="text-[13.5px] font-serif text-cg-dark/80 leading-relaxed italic">
                    {selectedClause.originalText || "No original text excerpt provided."}
                  </p>
                </div>
              </section>

              {/* Grid for minor details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {selectedClause.affectedParties && selectedClause.affectedParties.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Who It Affects</h3>
                    <ul className="space-y-1.5">
                      {selectedClause.affectedParties.map((party, i) => (
                        <li key={i} className="text-[14px] text-cg-dark flex items-start gap-2">
                          <span className="text-cg-green mt-0.5">•</span> {party}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {selectedClause.conditions && selectedClause.conditions.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Conditions</h3>
                    <ul className="space-y-1.5">
                      {selectedClause.conditions.map((cond, i) => (
                        <li key={i} className="text-[14px] text-cg-dark flex items-start gap-2">
                          <span className="text-cg-accent mt-0.5">•</span> {cond}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Linked Obligations Preview (Phase 4 scope) */}
              {selectedClause.obligations && selectedClause.obligations.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Associated Obligations</h3>
                  <div className="space-y-3">
                    {selectedClause.obligations.map((obl, i) => (
                      <div key={i} className="text-[14px] text-cg-dark bg-white border border-cg-border/60 p-3 rounded-md flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cg-green mt-1.5 shrink-0" />
                        <span className="leading-snug">{obl}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Source Grounding */}
              <section className="pt-2">
                <SourceCitation source={selectedClause.source} onSourceClick={onSourceClick} />
              </section>

            </div>
          </div>
        ) : (
          <div className="bg-white border border-cg-border rounded-xl shadow-sm h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
            <FileText className="size-12 text-cg-border mb-4" />
            <h3 className="text-[16px] font-semibold text-cg-dark mb-2">No Clause Selected</h3>
            <p className="text-[14px] text-cg-muted max-w-sm mx-auto">
              Select a clause from the list on the left to view its detailed analysis, obligations, and original text.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
