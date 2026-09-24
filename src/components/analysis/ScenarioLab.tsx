import { useState } from "react";
import { ScenarioAnalysis } from "@/lib/ai/schemas";
import { SourceCitation } from "./SourceCitation";
import { ArrowRight, Beaker, HelpCircle, AlertCircle, Link2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScenarioLabProps {
  documentId: string;
  onSourceClick: (page: number) => void;
  onNavigateToClause: (clauseId: string) => void;
}

const EXAMPLES = [
  "What happens if I resign after 6 months?",
  "What happens if the agreement is terminated early?",
  "What happens if a payment is late?",
  "What happens if confidential information is disclosed?"
];

export function ScenarioLab({ documentId, onSourceClick, onNavigateToClause }: ScenarioLabProps) {
  const [scenarioInput, setScenarioInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScenarioAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (scenarioToAnalyze: string = scenarioInput) => {
    if (!scenarioToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: scenarioToAnalyze
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "QUOTA_EXCEEDED") throw new Error("AI analysis quota exceeded. Please try again later.");
        if (data.error === "CONFIGURATION_ERROR") throw new Error("AI service is not configured correctly.");
        throw new Error("We couldn't analyze this scenario right now.");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">

      {/* Input Section */}
      <div className="bg-white border border-cg-border rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">
          <Beaker className="size-3.5" />
          Scenario Lab
        </div>
        <h2 className="text-[20px] font-semibold text-cg-dark leading-snug mb-2">
          Explore &quot;What happens if...&quot;
        </h2>
        <p className="text-[14px] text-cg-muted mb-8">
          Ask how a specific situation would be handled according to the uploaded document.
        </p>

        <div className="relative">
          <textarea
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            disabled={isAnalyzing}
            placeholder="e.g., What happens if I resign after 6 months?"
            className="w-full bg-cg-background border border-cg-border rounded-xl p-4 pr-[140px] text-[15px] text-cg-dark focus:outline-none focus:border-cg-green focus:ring-1 focus:ring-cg-green min-h-[100px] resize-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !scenarioInput.trim()}
            className="absolute right-3 bottom-3 bg-cg-dark text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-cg-dark/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze scenario"}
            {!isAnalyzing && <ArrowRight className="size-3.5" />}
          </button>
        </div>

        {!result && !isAnalyzing && (
          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cg-muted mb-3 block">Try an example</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setScenarioInput(ex);
                  }}
                  className="px-3 py-1.5 bg-cg-background border border-cg-border hover:border-cg-green/50 rounded-full text-[12px] text-cg-dark transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white border border-cg-attention/30 rounded-xl p-6 flex items-start gap-4 max-w-4xl mx-auto shadow-sm">
          <AlertCircle className="size-5 text-cg-attention shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-bold text-cg-dark mb-1">Analysis temporarily unavailable</h3>
            <p className="text-[14px] text-cg-muted">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
          <div className="size-12 relative mb-6">
            <div className="absolute inset-0 border-[3px] border-cg-border rounded-full" />
            <div className="absolute inset-0 border-[3px] border-cg-green rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="space-y-4 text-center">
            <p className="text-[14px] font-bold text-cg-dark">Analyzing your scenario</p>
            <p className="text-[13px] text-cg-muted">Tracing provisions and identifying obligations...</p>
          </div>
        </div>
      )}

      {/* Results State */}
      {result && !isAnalyzing && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="text-center mb-12">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-cg-muted mb-3">Your Scenario</h3>
            <p className="text-[24px] font-heading text-cg-dark">&quot;{result.scenario}&quot;</p>
          </div>

          <div className="bg-white border border-cg-border rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-8 border-b border-cg-border bg-cg-background/50">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">What the Document Says</h3>
              <p className="text-[15px] text-cg-dark leading-relaxed font-medium">
                {result.interpretation}
              </p>
            </div>

            {/* The Visual Chain */}
            <div className="p-8 space-y-6">

              {result.triggeringConditions.length > 0 && (
                <div className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-px before:bg-cg-border">
                  <div className="absolute left-0 top-1.5 size-[23px] rounded-full bg-cg-background border border-cg-border flex items-center justify-center text-[10px] font-bold text-cg-muted z-10">01</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Triggering Conditions</h4>
                  <div className="space-y-4">
                    {result.triggeringConditions.map((cond, i) => (
                      <div key={i} className="bg-cg-background border border-cg-border/50 rounded-xl p-5">
                        <p className="text-[14px] text-cg-dark mb-3">{cond.description}</p>
                        <SourceCitation source={cond.source} onSourceClick={onSourceClick} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.obligations.length > 0 && (
                <div className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-px before:bg-cg-border">
                  <div className="absolute left-0 top-1.5 size-[23px] rounded-full bg-cg-background border border-cg-border flex items-center justify-center text-[10px] font-bold text-cg-muted z-10">02</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Traced Obligations</h4>
                  <div className="space-y-4">
                    {result.obligations.map((obl, i) => (
                      <div key={i} className="bg-white border border-cg-border rounded-xl p-5 shadow-sm">
                        {obl.responsibleParty && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cg-green mb-1.5 block">
                            {obl.responsibleParty}
                          </span>
                        )}
                        <p className="text-[14px] text-cg-dark mb-3">{obl.description}</p>
                        {obl.timing && (
                          <div className="text-[12px] text-cg-muted font-medium mb-3 flex items-center gap-1.5">
                            <ArrowRight className="size-3" /> Timing: {obl.timing}
                          </div>
                        )}
                        <SourceCitation source={obl.source} onSourceClick={onSourceClick} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.consequences.length > 0 && (
                <div className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-px before:bg-cg-border">
                  <div className="absolute left-0 top-1.5 size-[23px] rounded-full bg-cg-background border border-cg-border flex items-center justify-center text-[10px] font-bold text-cg-muted z-10">03</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Document-Stated Consequences</h4>
                  <div className="space-y-4">
                    {result.consequences.map((cons, i) => (
                      <div key={i} className={cn(
                        "rounded-xl p-5 border shadow-sm",
                        cons.certainty === "stated" ? "bg-white border-cg-border" : "bg-cg-background border-cg-border/50"
                      )}>
                        <div className="flex items-start gap-2">
                          <p className="text-[14px] text-cg-dark mb-3 leading-relaxed">{cons.description}</p>
                        </div>
                        {cons.certainty === "not_specified" && (
                          <span className="inline-block px-2 py-1 bg-cg-border/50 rounded text-[10px] font-bold uppercase tracking-wider text-cg-muted mb-3">Not explicitly specified</span>
                        )}
                        <SourceCitation source={cons.source} onSourceClick={onSourceClick} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.relevantClauses.length > 0 && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 size-[23px] rounded-full bg-cg-background border border-cg-border flex items-center justify-center text-[10px] font-bold text-cg-muted z-10">04</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-3">Related Provisions</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.relevantClauses.map((clause, i) => (
                      <div key={i} className="flex items-center gap-2 bg-cg-background border border-cg-border rounded-lg px-4 py-2.5">
                        <span className="text-[13px] font-medium text-cg-dark">{clause.title}</span>
                        {clause.clauseId && (
                          <button
                            onClick={() => onNavigateToClause(clause.clauseId!)}
                            className="ml-2 text-cg-green hover:bg-cg-green/10 p-1 rounded transition-colors"
                            title="View Clause"
                          >
                            <Link2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Not Specified */}
            {result.missingInformation.length > 0 && (
              <div className="bg-white border border-cg-border border-dashed rounded-xl p-6">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4 flex items-center gap-2">
                  <HelpCircle className="size-3.5" />
                  Not Specified
                </h4>
                <ul className="space-y-3">
                  {result.missingInformation.map((info, i) => (
                    <li key={i} className="text-[13.5px] text-cg-dark/80 leading-relaxed flex items-start gap-2">
                      <span className="text-cg-muted mt-1">•</span> {info}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions to ask */}
            {result.professionalQuestions.length > 0 && (
              <div className="bg-white border border-cg-accent/30 rounded-xl p-6">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-accent mb-4 flex items-center gap-2">
                  Questions for a Professional
                </h4>
                <ul className="space-y-3">
                  {result.professionalQuestions.map((q, i) => (
                    <li key={i} className="text-[13.5px] text-cg-dark leading-relaxed flex items-start gap-2">
                      <span className="text-cg-accent mt-1">?</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => {
                setResult(null);
                setScenarioInput("");
              }}
              className="text-[13px] font-medium text-cg-green hover:underline inline-flex items-center gap-1.5"
            >
              <ArrowDown className="size-3.5" />
              Analyze another scenario
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
