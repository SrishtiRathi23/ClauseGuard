import { useState } from "react";
import { DocumentAnalysis, ProfessionalQuestionSet } from "@/lib/ai/schemas";
import { SourceCitation } from "./SourceCitation";
import { Copy, Printer, AlertCircle, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";

interface ReviewBriefProps {
  documentId: string;
  docTitle?: string;
  analysis: DocumentAnalysis;
  onSourceClick: (page: number) => void;
  onNavigateToClause: (clauseId: string) => void;
}

export function ReviewBrief({ documentId, docTitle, analysis, onSourceClick, onNavigateToClause }: ReviewBriefProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionSet, setQuestionSet] = useState<ProfessionalQuestionSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus: "general" })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "QUOTA_EXCEEDED") throw new Error("AI analysis quota exceeded.");
        throw new Error("We couldn't generate questions right now.");
      }
      setQuestionSet(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!questionSet) return;
    const text = [
      "Questions to discuss with a legal professional:",
      ...questionSet.questions.map((q, i) => `${i + 1}. ${q.question}`),
      "",
      "What the document does not specify:",
      ...questionSet.missingInformation.map((m) => `- ${m}`)
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const importantClauses = analysis.clauses.filter(c => c.attentionLevel === "review" || c.attentionLevel === "important");

  return (
    <div className="pb-24 print:pb-0">

      {/* Hide on print */}
      <div className="print:hidden bg-white border border-cg-border rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto mb-10">
        <h2 className="text-[20px] font-semibold text-cg-dark leading-snug mb-2">
          Prepare for review
        </h2>
        <p className="text-[14px] text-cg-muted mb-6">
          Turn your document analysis into focused questions for a qualified legal professional.
        </p>
        <div className="flex items-center gap-2 text-[12px] text-cg-muted bg-cg-background p-3 rounded-lg border border-cg-border/50">
          <AlertCircle className="size-4 shrink-0" />
          <span>This brief is based on the uploaded document and is not legal advice.</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-cg-border rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none print:max-w-none">

        {/* Document Header */}
        <div className="p-8 md:p-12 border-b border-cg-border bg-cg-background/30 print:bg-transparent print:border-b-2 print:border-black">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cg-muted mb-6 print:text-black">ClauseGuard Professional Review Brief</p>
          <h1 className="text-3xl font-heading text-cg-dark mb-4 print:text-black">{docTitle || "Uploaded Document"}</h1>
          <div className="flex flex-col sm:flex-row gap-6 text-[13px] text-cg-muted print:text-black">
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Type</span>
              {analysis.documentType}
            </div>
            {analysis.parties && analysis.parties.length > 0 && (
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Parties</span>
                {analysis.parties.map(p => p.name).join(" / ")}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">

          {/* Document at a glance */}
          <section>
            <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4 border-b border-cg-border pb-2 print:text-black print:border-black">Document at a Glance</h2>
            <p className="text-[14px] text-cg-dark leading-relaxed">{analysis.summary}</p>
          </section>

          {/* Areas to review */}
          {(importantClauses.length > 0 || analysis.attentionPoints.length > 0) && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4 border-b border-cg-border pb-2 print:text-black print:border-black">Areas to Review</h2>
              <div className="space-y-4">
                {analysis.attentionPoints.map((pt, i) => (
                  <div key={`pt-${i}`} className="bg-cg-background border border-cg-border/50 rounded-xl p-5 print:border-black/20 print:bg-transparent">
                    <h3 className="text-[14px] font-bold text-cg-dark mb-2 flex items-center gap-2">
                      {pt.level === "important" && <AlertCircle className="size-4 text-cg-attention" />}
                      {pt.title}
                    </h3>
                    <p className="text-[14px] text-cg-dark mb-3">{pt.explanation}</p>
                    <SourceCitation source={pt.source} onSourceClick={onSourceClick} />
                  </div>
                ))}
                {importantClauses.map((cl, i) => (
                  <div key={`cl-${i}`} className="bg-white border border-cg-border rounded-xl p-5 shadow-sm print:shadow-none print:border-black/20">
                    <h3 className="text-[14px] font-bold text-cg-dark mb-2">{cl.title}</h3>
                    <p className="text-[14px] text-cg-dark mb-3">{cl.plainLanguage}</p>
                    <SourceCitation source={cl.source} onSourceClick={onSourceClick} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Obligations */}
          {analysis.obligations && analysis.obligations.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4 border-b border-cg-border pb-2 print:text-black print:border-black">Obligations to Discuss</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.obligations.slice(0, 6).map((obl, i) => (
                  <div key={i} className="border border-cg-border rounded-xl p-4 print:border-black/20">
                    {obl.responsibleParty && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cg-green mb-1 block print:text-black">
                        {obl.responsibleParty}
                      </span>
                    )}
                    <p className="text-[13px] text-cg-dark mb-3">{obl.description}</p>
                    <SourceCitation source={obl.source} onSourceClick={onSourceClick} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Questions Section */}
          <section className="pt-8 border-t border-cg-border print:border-t-2 print:border-black">
            <div className="flex items-center justify-between mb-8 print:hidden">
              <div>
                <h2 className="text-[20px] font-semibold text-cg-dark">Questions to Ask</h2>
                <p className="text-[13px] text-cg-muted mt-1">Generate specific questions grounded in this document&apos;s text.</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-cg-dark text-white px-5 h-10 rounded-lg text-[13px] font-medium hover:bg-cg-dark/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isGenerating ? "Generating..." : "Generate questions"}
                {!isGenerating && <ArrowRight className="size-3.5" />}
              </button>
            </div>

            <h2 className="hidden print:block text-[12px] font-bold uppercase tracking-[0.15em] text-black mb-4 border-b border-black pb-2">Questions for Legal Counsel</h2>

            {error && (
              <div className="bg-white border border-cg-attention/30 rounded-xl p-4 flex items-center gap-3 mb-6 print:hidden">
                <AlertCircle className="size-4 text-cg-attention" />
                <span className="text-[13px] text-cg-dark font-medium">{error}</span>
              </div>
            )}

            {isGenerating && (
              <div className="py-12 flex flex-col items-center justify-center animate-in fade-in print:hidden">
                <div className="size-8 relative mb-4">
                  <div className="absolute inset-0 border-2 border-cg-border rounded-full" />
                  <div className="absolute inset-0 border-2 border-cg-green rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-[13px] font-medium text-cg-dark">Drafting professional questions...</p>
              </div>
            )}

            {questionSet && !isGenerating && (
              <div className="space-y-8 animate-in fade-in">

                {/* Questions List */}
                <div className="space-y-6">
                  {questionSet.questions.map((q, i) => (
                    <div key={i} className="bg-white border border-cg-border rounded-xl p-6 shadow-sm relative group print:shadow-none print:border-black/20 print:break-inside-avoid">

                      <div className="pr-12">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cg-accent mb-2 block print:text-black">
                          {q.category}
                        </span>
                        <h3 className="text-[16px] font-bold text-cg-dark mb-3 leading-snug">
                          {q.question}
                        </h3>
                        <p className="text-[13px] text-cg-dark/80 bg-cg-background p-3 rounded-lg border border-cg-border/50 mb-4 print:border-black/10">
                          <span className="font-semibold block mb-1">Why this matters:</span>
                          {q.whyItMatters}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <SourceCitation source={q.source} onSourceClick={onSourceClick} />

                        {q.relatedClauseId && (
                          <button
                            onClick={() => onNavigateToClause(q.relatedClauseId!)}
                            className="text-[12px] text-cg-green hover:underline print:hidden"
                          >
                            View related clause
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopyQuestion(q.question, i)}
                        className="absolute top-4 right-4 p-2 text-cg-muted hover:text-cg-dark hover:bg-cg-background rounded-md opacity-0 group-hover:opacity-100 transition-all print:hidden"
                        title="Copy question"
                        aria-label="Copy question"
                      >
                        {copiedIndex === i ? <CheckCircle2 className="size-4 text-cg-green" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                      </button>

                    </div>
                  ))}
                </div>

                {/* Missing Info */}
                {questionSet.missingInformation.length > 0 && (
                  <div className="bg-cg-background/50 border border-cg-border border-dashed rounded-xl p-6 print:border-black/30 print:break-inside-avoid">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4 flex items-center gap-2 print:text-black">
                      <HelpCircle className="size-3.5" />
                      What the document does not specify
                    </h4>
                    <ul className="space-y-2">
                      {questionSet.missingInformation.map((info, i) => (
                        <li key={i} className="text-[13px] text-cg-dark flex items-start gap-2">
                          <span className="text-cg-muted mt-0.5">•</span> {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between pt-6 border-t border-cg-border print:hidden">
                  <p className="text-[11px] text-cg-muted uppercase tracking-widest">{questionSet.questions.length} Questions generated</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyAll}
                      className="text-[13px] font-medium text-cg-dark bg-white border border-cg-border px-4 py-2 rounded-lg hover:bg-cg-background transition-colors flex items-center gap-2"
                    >
                      {copiedAll ? <CheckCircle2 className="size-4 text-cg-green" /> : <Copy className="size-4" />}
                      {copiedAll ? "Copied!" : "Copy all"}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="text-[13px] font-medium text-cg-dark bg-white border border-cg-border px-4 py-2 rounded-lg hover:bg-cg-background transition-colors flex items-center gap-2"
                    >
                      <Printer className="size-4" />
                      Print brief
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-cg-muted text-center max-w-lg mx-auto pt-8">
                  {questionSet.disclaimer}
                </div>

              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
