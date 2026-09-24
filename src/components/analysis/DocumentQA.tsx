import { useState } from "react";
import { DocumentAnalysis, DocumentQAResponse } from "@/lib/ai/schemas";
import { SourceCitation } from "./SourceCitation";
import { Search, ArrowRight, HelpCircle, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentQAProps {
  documentId: string;
  docTitle?: string;
  analysis: DocumentAnalysis;
  onSourceClick: (page: number) => void;
  onNavigateToClause: (clauseId: string) => void;
}

export function DocumentQA({ documentId, docTitle, analysis, onSourceClick, onNavigateToClause }: DocumentQAProps) {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DocumentQAResponse[]>([]);
  const [activeResponse, setActiveResponse] = useState<DocumentQAResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const SUGGESTED_QUESTIONS = [
    "What is the notice period?",
    "Who owns the intellectual property?",
    "Does confidentiality continue after termination?",
    "When is payment due?"
  ];

  const handleAsk = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (trimmed.length > 1000) {
      setError("Question is too long (maximum 1000 characters).");
      return;
    }

    setIsAsking(true);
    setError(null);
    setActiveResponse(null);
    setQuestion(trimmed);

    try {
      const res = await fetch(`/api/documents/${documentId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "QUOTA_EXCEEDED") throw new Error("Document Q&A is temporarily unavailable because the AI usage limit has been reached.");
        if (data.error === "INVALID_QUESTION") throw new Error("Please enter a valid question.");
        if (data.error === "QUESTION_TOO_LONG") throw new Error("Question is too long (maximum 1000 characters).");
        throw new Error("We couldn't answer that question right now.");
      }

      setActiveResponse(data);
      setHistory(prev => [data, ...prev].slice(0, 10));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!activeResponse) return;
    const text = [
      `Q: ${activeResponse.question}`,
      `A: ${activeResponse.answer}`,
      activeResponse.sources.length > 0 ? `\nSources: ${activeResponse.sources.map(s => `Page ${s.page}`).join(", ")}` : ""
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-24 flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

      {/* LEFT COLUMN: Input & History */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white border border-cg-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">
            Ask about this document
          </h2>
          <p className="text-[13px] font-medium text-cg-dark mb-6 truncate">{docTitle || "Uploaded Document"}</p>

          <div className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your document..."
              aria-label="Ask a question about your document"
              className="w-full h-24 p-3 border border-cg-border rounded-xl text-[14px] text-cg-dark bg-cg-background focus:outline-none focus:border-cg-green focus:ring-1 focus:ring-cg-green resize-none"
              disabled={isAsking}
              maxLength={1000}
            />

            <button
              onClick={() => handleAsk(question)}
              disabled={isAsking || !question.trim()}
              className="w-full bg-cg-dark text-white px-4 h-10 rounded-lg text-[13px] font-medium hover:bg-cg-dark/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isAsking ? "Preparing answer..." : "Ask"}
              {!isAsking && <ArrowRight className="size-3.5" />}
            </button>
          </div>

          <p className="text-[11px] text-cg-muted mt-4 leading-relaxed">
            Answers are based on the uploaded document and may not address questions outside it.
          </p>
        </div>

        {/* Suggested Questions */}
        {!activeResponse && history.length === 0 && (
          <div className="bg-cg-background/50 border border-cg-border border-dashed rounded-xl p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">Suggested Questions</h3>
            <ul className="space-y-2">
              {SUGGESTED_QUESTIONS.map((sq, i) => (
                <li key={i}>
                  <button
                    onClick={() => setQuestion(sq)}
                    disabled={isAsking}
                    className="text-[13px] text-cg-dark hover:text-cg-green text-left leading-relaxed transition-colors flex items-start gap-2"
                  >
                    <span className="text-cg-green/50 mt-1">→</span> {sq}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white border border-cg-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted">Previous questions</h3>
              <button
                onClick={() => { setHistory([]); setActiveResponse(null); setQuestion(""); }}
                className="text-[11px] text-cg-muted hover:text-cg-dark"
                aria-label="Clear question history"
              >
                Clear
              </button>
            </div>
            <ul className="space-y-3">
              {history.map((h, i) => (
                <li key={i}>
                  <button
                    onClick={() => { setActiveResponse(h); setQuestion(h.question); setError(null); }}
                    className={cn(
                      "text-[13px] text-left leading-relaxed transition-colors block w-full p-2 rounded-lg -mx-2",
                      activeResponse === h ? "bg-cg-background font-medium text-cg-dark" : "text-cg-dark/70 hover:bg-cg-background/50"
                    )}
                  >
                    {h.question}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Answer */}
      <div className="w-full lg:w-2/3">
        {error && (
          <div className="bg-white border border-cg-attention/30 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in h-64">
            <AlertCircle className="size-6 text-cg-attention mb-4" />
            <p className="text-[14px] text-cg-dark font-medium mb-4">{error}</p>
            <button onClick={() => setError(null)} className="text-[13px] text-cg-muted hover:text-cg-dark border border-cg-border px-4 py-2 rounded-lg">Try again</button>
          </div>
        )}

        {isAsking && (
          <div className="bg-white border border-cg-border rounded-2xl p-12 flex flex-col items-center justify-center text-center animate-in fade-in h-full min-h-[400px]">
            <div className="size-10 relative mb-6">
              <div className="absolute inset-0 border-2 border-cg-border rounded-full" />
              <div className="absolute inset-0 border-2 border-cg-green rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-[15px] font-bold text-cg-dark mb-2">Analyzing your document...</p>
            <p className="text-[13px] text-cg-muted">Finding relevant provisions and tracing supporting clauses.</p>
          </div>
        )}

        {activeResponse && !isAsking && (
          <div className="bg-white border border-cg-border rounded-2xl p-6 sm:p-10 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-cg-border">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-2">Answer</h2>
                <h3 className="text-[20px] font-semibold text-cg-dark leading-snug">{activeResponse.question}</h3>
              </div>
              <button
                onClick={handleCopyAnswer}
                className="p-2 text-cg-muted hover:text-cg-dark bg-cg-background rounded-lg transition-colors flex shrink-0 items-center justify-center"
                title="Copy answer"
                aria-label="Copy answer"
              >
                {copied ? <CheckCircle2 className="size-4 text-cg-green" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              </button>
            </div>

            {activeResponse.answerStatus === "not_found" ? (
              <div className="bg-cg-background/50 border border-cg-border border-dashed rounded-xl p-6 mb-8 text-center">
                <HelpCircle className="size-6 text-cg-muted mx-auto mb-4" />
                <h4 className="text-[15px] font-bold text-cg-dark mb-2">I couldn&apos;t determine that from the document.</h4>
                <p className="text-[14px] text-cg-muted mb-4">
                  The uploaded document does not provide enough information to answer this question.
                </p>
                <p className="text-[13px] text-cg-dark font-medium px-4 py-3 bg-white border border-cg-border rounded-lg inline-block">
                  {activeResponse.answer}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {activeResponse.answerStatus === "uncertain" && (
                  <div className="bg-cg-accent/10 border border-cg-accent/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="size-5 text-cg-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-bold text-cg-dark mb-1">The document provides related information, but does not fully specify this.</h4>
                      <p className="text-[13px] text-cg-dark/80">I have extracted what is present below.</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-3">Plain-language explanation</h4>
                  <p className="text-[15px] text-cg-dark leading-relaxed font-medium whitespace-pre-wrap bg-cg-background/30 p-5 rounded-xl border border-cg-border/50">
                    {activeResponse.answer}
                  </p>
                </div>

                {activeResponse.sources.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-3">Sources</h4>
                    <div className="space-y-4">
                      {activeResponse.sources.map((src, idx) => (
                        <div key={idx} className="bg-white border border-cg-border p-4 rounded-xl shadow-sm">
                          <SourceCitation source={src} onSourceClick={onSourceClick} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((activeResponse.relatedClauseIds && activeResponse.relatedClauseIds.length > 0) ||
                  (activeResponse.relatedObligationIds && activeResponse.relatedObligationIds.length > 0)) && (
                  <div className="pt-6 border-t border-cg-border grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {activeResponse.relatedClauseIds && activeResponse.relatedClauseIds.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-3">Related Clauses</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeResponse.relatedClauseIds.map((cid, i) => {
                            const clause = analysis.clauses.find(c => c.id === cid);
                            return clause ? (
                              <button
                                key={i}
                                onClick={() => onNavigateToClause(cid)}
                                className="text-[12px] font-medium text-cg-dark bg-cg-background hover:bg-cg-green/10 border border-cg-border px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                              >
                                {clause.title} <ArrowRight className="size-3" />
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {activeResponse.relatedObligationIds && activeResponse.relatedObligationIds.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-3">Related Obligations</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeResponse.relatedObligationIds.map((oid, i) => {
                            const obl = analysis.obligations.find(o => o.id === oid);
                            return obl ? (
                              <div key={i} className="text-[12px] font-medium text-cg-dark bg-cg-background border border-cg-border px-3 py-1.5 rounded-full truncate max-w-full">
                                {obl.description}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {activeResponse.followUpQuestions && activeResponse.followUpQuestions.length > 0 && (
                  <div className="pt-6 border-t border-cg-border">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-3 flex items-center gap-2">
                      <Search className="size-3.5" /> Follow-up questions
                    </h4>
                    <div className="space-y-2">
                      {activeResponse.followUpQuestions.map((fq, i) => (
                        <button
                          key={i}
                          onClick={() => setQuestion(fq)}
                          className="block w-full text-left text-[13px] text-cg-dark hover:text-cg-green bg-white hover:bg-cg-green/5 border border-cg-border p-3 rounded-lg transition-colors"
                        >
                          {fq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {!activeResponse && !isAsking && !error && (
          <div className="h-full min-h-[400px] border-2 border-cg-border border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-cg-background/30">
            <Search className="size-8 text-cg-muted mb-4 opacity-50" />
            <p className="text-[15px] font-medium text-cg-dark mb-2">Ready to answer</p>
            <p className="text-[13px] text-cg-muted max-w-sm">
              Ask a question on the left, and ClauseGuard will trace the answer directly to the original document text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
