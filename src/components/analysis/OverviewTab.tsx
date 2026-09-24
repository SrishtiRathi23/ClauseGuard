import { DocumentAnalysis } from "@/lib/ai/schemas";
import { SourceCitation } from "./SourceCitation";
import { ArrowRight } from "lucide-react";

interface OverviewTabProps {
  analysis: DocumentAnalysis;
  onNavigateToClauses: () => void;
  onNavigateToQA: () => void;
  onSourceClick: (page: number) => void;
}

export function OverviewTab({ analysis, onNavigateToClauses, onNavigateToQA, onSourceClick }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: Summary & Clauses */}
      <div className="lg:col-span-2 space-y-12">
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">Summary</h2>
          <div className="prose prose-sm max-w-none text-cg-dark leading-relaxed text-[15px]">
            {analysis.summary ? (
              analysis.summary.split('\n').map((p, i) => (
                p.trim() && <p key={i} className="mb-4">{p}</p>
              ))
            ) : (
              <p className="italic text-cg-muted">Not identified in the document.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-6">Clause Overview</h2>
          <div className="space-y-4">
            {analysis.clauses && analysis.clauses.length > 0 ? (
              analysis.clauses.slice(0, 3).map((clause) => (
                <div key={clause.id} className="bg-white border border-cg-border rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading text-lg text-cg-dark mb-3">{clause.title}</h3>
                  <p className="text-[14px] text-cg-muted leading-relaxed mb-4">{clause.plainLanguage}</p>

                  <SourceCitation source={clause.source} onSourceClick={onSourceClick} />
                </div>
              ))
            ) : (
              <p className="text-[14px] text-cg-muted italic">No specific clauses were extracted.</p>
            )}

            {analysis.clauses && analysis.clauses.length > 0 && (
              <div className="pt-2 flex justify-start">
                <button
                  onClick={onNavigateToClauses}
                  className="text-[13px] font-medium text-cg-green flex items-center gap-1.5 hover:underline"
                >
                  View all {analysis.clauses.length} clauses in Explorer <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Parties & Points to Review */}
      <div className="space-y-12">
        <section>
          <div className="bg-cg-dark text-white rounded-2xl p-6 shadow-md relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[16px] font-bold mb-2">Have a question?</h3>
              <p className="text-[13px] text-white/80 mb-6 max-w-[200px] leading-relaxed">
                Ask questions about clauses, obligations, and deadlines.
              </p>
              <button
                onClick={onNavigateToQA}
                className="bg-white text-cg-dark px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-cg-background transition-colors flex items-center gap-2"
              >
                Ask about this document <ArrowRight className="size-4" />
              </button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -right-12 -bottom-12 size-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">Parties</h2>
          <div className="bg-white border border-cg-border rounded-xl p-5 shadow-sm space-y-4">
            {analysis.parties && analysis.parties.length > 0 ? (
              analysis.parties.map((party, i) => (
                <div key={i} className={i > 0 ? "pt-4 border-t border-cg-border" : ""}>
                  <p className="text-[14px] font-semibold text-cg-dark mb-1">{party.name}</p>
                  <p className="text-[12px] text-cg-muted uppercase tracking-wide">{party.role}</p>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-cg-muted italic">No named parties identified.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">Points to Review</h2>
          <div className="space-y-4">
            {analysis.attentionPoints && analysis.attentionPoints.length > 0 ? (
              analysis.attentionPoints.slice(0, 4).map((pt) => {
                const borderColors = {
                  important: "border-l-cg-attention",
                  review: "border-l-cg-accent",
                  information: "border-l-cg-green"
                };
                return (
                  <div key={pt.id} className={`bg-white border border-cg-border rounded-xl p-5 shadow-sm border-l-2 ${borderColors[pt.level as keyof typeof borderColors] || "border-l-cg-border"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-[14px] font-bold text-cg-dark leading-snug">{pt.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cg-muted bg-cg-background px-1.5 py-0.5 rounded">
                        {pt.level}
                      </span>
                    </div>
                    <p className="text-[13px] text-cg-muted leading-relaxed mb-4">{pt.explanation}</p>
                    <SourceCitation source={pt.source} onSourceClick={onSourceClick} />
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-cg-border rounded-xl p-5 shadow-sm">
                <p className="text-[13px] text-cg-muted italic">No specific points requiring review were identified.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
