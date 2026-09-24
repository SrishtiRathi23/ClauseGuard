import { DocumentAnalysis } from "@/lib/ai/schemas";
import { useState, useMemo } from "react";
import { Search, Briefcase, CalendarClock, Link2 } from "lucide-react";
import { SourceCitation } from "./SourceCitation";
import { cn } from "@/lib/utils";

interface ObligationMapProps {
  analysis: DocumentAnalysis;
  onSourceClick: (page: number) => void;
  onNavigateToClause: (clauseId: string) => void;
}

export function ObligationMap({ analysis, onSourceClick, onNavigateToClause }: ObligationMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterParty, setFilterParty] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");

  const obligations = useMemo(() => analysis.obligations || [], [analysis.obligations]);

  const [selectedObligationId, setSelectedObligationId] = useState<string | null>(
    obligations.length > 0 ? obligations[0].id : null
  );

  // Extract unique parties for filter
  const parties = useMemo(() => {
    const pSet = new Set(obligations.map(o => o.responsibleParty).filter(Boolean));
    return ["All", ...Array.from(pSet)];
  }, [obligations]);

  // Extract unique obligation types for filter
  const types = useMemo(() => {
    const tSet = new Set(obligations.map(o => o.obligationType).filter(Boolean));
    return ["All", ...Array.from(tSet)];
  }, [obligations]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return {
      total: obligations.length,
      deadlines: obligations.filter(o => o.deadline).length,
      continuing: obligations.filter(o => o.continuing).length,
      parties: parties.length > 1 ? parties.length - 1 : 0
    };
  }, [obligations, parties]);

  // Client-side filtering and searching
  const filteredObligations = useMemo(() => {
    return obligations.filter(obl => {
      if (filterParty !== "All" && obl.responsibleParty !== filterParty) return false;
      if (filterType !== "All" && obl.obligationType !== filterType) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = obl.description?.toLowerCase().includes(query);
        const matchesParty = obl.responsibleParty?.toLowerCase().includes(query);
        const matchesType = obl.obligationType?.toLowerCase().includes(query);
        const matchesDeadline = obl.deadline?.toLowerCase().includes(query);
        const matchesSource = obl.source?.textQuote?.toLowerCase().includes(query);

        if (!matchesDesc && !matchesParty && !matchesType && !matchesDeadline && !matchesSource) return false;
      }
      return true;
    });
  }, [obligations, searchQuery, filterParty, filterType]);

  const selectedObligation = useMemo(() => {
    return obligations.find(o => o.id === selectedObligationId) || null;
  }, [obligations, selectedObligationId]);

  if (obligations.length === 0) {
    return (
      <div className="bg-white border border-cg-border rounded-xl shadow-sm h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
        <Briefcase className="size-12 text-cg-border mb-4" />
        <h3 className="text-[16px] font-semibold text-cg-dark mb-2">No explicit obligations were identified</h3>
        <p className="text-[14px] text-cg-muted max-w-sm mx-auto">
          ClauseGuard did not identify structured obligations in the analyzed document. This does not mean the document contains no obligations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Obligations", count: metrics.total },
          { label: "Deadlines", count: metrics.deadlines },
          { label: "Continuing", count: metrics.continuing },
          { label: "Parties", count: metrics.parties },
        ].map((metric) => (
          <div key={metric.label} className="bg-white border border-cg-border rounded-xl p-5 shadow-sm text-center">
            <span className="block font-heading text-3xl sm:text-4xl text-cg-dark mb-1">{metric.count}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cg-muted">{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        {/* Left Sidebar: List & Filters */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cg-muted" />
            <input
              type="text"
              placeholder="Search obligations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-cg-border rounded-lg text-[14px] text-cg-dark focus:outline-none focus:border-cg-green focus:ring-1 focus:ring-cg-green transition-all"
              aria-label="Search obligations"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="px-3 py-1.5 bg-white border border-cg-border rounded-md text-[12px] font-medium text-cg-dark focus:outline-none focus:border-cg-green"
            >
              {parties.map(p => (
                <option key={p} value={p}>
                  {p === "All" ? "All Parties" : p}
                </option>
              ))}
            </select>

            {types.length > 1 && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-white border border-cg-border rounded-md text-[12px] font-medium text-cg-dark focus:outline-none focus:border-cg-green"
              >
                {types.map(t => (
                  <option key={t} value={t}>
                    {t === "All" ? "All Types" : t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Obligation List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-2 pb-4">
            {filteredObligations.length > 0 ? (
              filteredObligations.map((obl) => (
                <button
                  key={obl.id}
                  onClick={() => setSelectedObligationId(obl.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all duration-200",
                    selectedObligationId === obl.id
                      ? "bg-white border-cg-green shadow-sm ring-1 ring-cg-green/20"
                      : "bg-white/50 border-cg-border hover:bg-white hover:border-cg-border/80"
                  )}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cg-green truncate">
                      {obl.responsibleParty || "Party not identified"}
                    </span>
                    {obl.continuing && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cg-accent bg-cg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                        Continuing
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-[14px] text-cg-dark leading-snug mb-2 line-clamp-2">
                    {obl.description}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] font-medium text-cg-muted">
                    <span className="uppercase tracking-wider">{obl.obligationType?.replace(/_/g, " ")}</span>
                    {obl.deadline && (
                      <span className="flex items-center gap-1 max-w-[50%] truncate">
                        <CalendarClock className="size-3 shrink-0" />
                        <span className="truncate">{obl.deadline}</span>
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-cg-border rounded-lg">
                <p className="text-[14px] text-cg-muted">No obligations match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Obligation Detail */}
        <div className="w-full lg:w-2/3">
          {selectedObligation ? (
            <div className="bg-white border border-cg-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 sm:px-8 py-6 border-b border-cg-border bg-cg-background/50">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">
                  <Briefcase className="size-3.5" />
                  {selectedObligation.obligationType?.replace(/_/g, " ")} Requirement
                </div>
                <h2 className="text-[20px] font-semibold text-cg-dark leading-snug">
                  {selectedObligation.description}
                </h2>

                <div className="mt-5 flex flex-wrap gap-4">
                  <div className="bg-white border border-cg-border px-3 py-1.5 rounded-md flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cg-muted mb-0.5">Responsible Party</span>
                    <span className="text-[13px] font-medium text-cg-dark">{selectedObligation.responsibleParty || "Not identified"}</span>
                  </div>
                  {selectedObligation.deadline && (
                    <div className="bg-white border border-cg-border px-3 py-1.5 rounded-md flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cg-muted mb-0.5">Deadline</span>
                      <span className="text-[13px] font-medium text-cg-dark">{selectedObligation.deadline}</span>
                    </div>
                  )}
                  {selectedObligation.continuing && (
                    <div className="bg-cg-accent/10 border border-cg-accent/20 px-3 py-1.5 rounded-md flex flex-col justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cg-accent">Continuing Obligation</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-10">

                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">What is required?</h3>
                  <p className="text-[15px] text-cg-dark leading-relaxed">
                    The analyzed document identifies this as an obligation for {selectedObligation.responsibleParty || "the party"}. {selectedObligation.description}
                  </p>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Timing</h3>
                    <p className="text-[14px] text-cg-dark flex items-start gap-2">
                      <CalendarClock className="size-4 text-cg-muted mt-0.5 shrink-0" />
                      {selectedObligation.deadline || "Not specified"}
                    </p>
                  </section>
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Status</h3>
                    <p className="text-[14px] text-cg-dark flex items-start gap-2">
                      <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", selectedObligation.continuing ? "bg-cg-accent" : "bg-cg-border")} />
                      {selectedObligation.continuing ? "Continues ongoing" : "One-time or standard requirement"}
                    </p>
                  </section>
                </div>

                {selectedObligation.source?.clauseId && (
                  <section className="bg-cg-background rounded-lg p-4 border border-cg-border flex items-center justify-between">
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-1">Related Clause</h3>
                      <p className="text-[13px] font-medium text-cg-dark">
                        This obligation is tied to a specific clause.
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigateToClause(selectedObligation.source!.clauseId!)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-cg-border rounded-md text-[12px] font-medium text-cg-dark hover:bg-cg-green/5 hover:text-cg-green hover:border-cg-green/30 transition-colors"
                    >
                      <Link2 className="size-3.5" />
                      View Clause
                    </button>
                  </section>
                )}

                <section className="pt-2">
                  <SourceCitation source={selectedObligation.source} onSourceClick={onSourceClick} />
                </section>

              </div>
            </div>
          ) : (
            <div className="bg-white border border-cg-border rounded-xl shadow-sm h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
              <Briefcase className="size-12 text-cg-border mb-4" />
              <h3 className="text-[16px] font-semibold text-cg-dark mb-2">No Obligation Selected</h3>
              <p className="text-[14px] text-cg-muted max-w-sm mx-auto">
                Select an obligation from the list on the left to view its detailed breakdown, timing, and original text.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
