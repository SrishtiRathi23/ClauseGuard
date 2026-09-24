"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useRef } from "react";
import { UploadIcon, FileText, X, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonAnalysis } from "@/lib/ai/schemas";

export default function ComparePage() {
  const [docAFile, setDocAFile] = useState<File | null>(null);
  const [docBFile, setDocBFile] = useState<File | null>(null);

  const [state, setState] = useState<"IDLE" | "UPLOADING" | "COMPARING" | "RESULTS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [result, setResult] = useState<ComparisonAnalysis | null>(null);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleFileASelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Document A is larger than 10 MB.");
      setState("ERROR");
      return;
    }
    setDocAFile(file);
    if (state === "ERROR") setState("IDLE");
  };

  const handleFileBSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Document B is larger than 10 MB.");
      setState("ERROR");
      return;
    }
    setDocBFile(file);
    if (state === "ERROR") setState("IDLE");
  };

  const uploadDoc = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.documentId;
  };

  const handleCompare = async () => {
    if (!docAFile || !docBFile) return;

    setState("UPLOADING");
    setErrorMsg(null);

    try {
      const docAId = await uploadDoc(docAFile);
      const docBId = await uploadDoc(docBFile);

      setState("COMPARING");

      const compareRes = await fetch("/api/documents/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentAId: docAId, documentBId: docBId })
      });

      const compareData = await compareRes.json();

      if (!compareRes.ok) {
        if (compareData.error === "QUOTA_EXCEEDED") throw new Error("AI analysis quota exceeded.");
        throw new Error("We couldn't compare these documents.");
      }

      setResult(compareData);
      setState("RESULTS");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred during comparison.");
      }
      setState("ERROR");
    }
  };

  const renderUploader = (
    label: string,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onSelect: (f: File) => void,
    onClear: () => void
  ) => {
    return (
      <div
        className={cn(
          "border border-dashed rounded-xl p-8 text-center transition-colors relative flex-1 min-h-[220px] flex flex-col justify-center",
          !file ? "border-cg-border/80 bg-white hover:border-cg-green/50 cursor-pointer" : "border-cg-border bg-white"
        )}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => e.target.files && onSelect(e.target.files[0])}
          className="hidden"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        />

        {!file ? (
          <div className="flex flex-col items-center pointer-events-none">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cg-background border border-cg-border mb-4">
              <UploadIcon className="size-4 text-cg-dark" strokeWidth={1.5} />
            </div>
            <p className="text-[12px] font-bold text-cg-muted uppercase tracking-widest mb-2">{label}</p>
            <p className="text-[14px] font-bold text-cg-dark mb-1">Upload document</p>
            <p className="text-[12px] text-cg-muted mb-4">PDF, DOCX or TXT</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-3 right-3 p-1.5 text-cg-muted hover:text-cg-dark hover:bg-cg-background rounded-full transition-colors"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cg-green/10 mb-3">
              <FileText className="size-4 text-cg-green" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-bold text-cg-green uppercase tracking-widest mb-1.5">{label}</p>
            <p className="text-[13px] font-medium text-cg-dark mb-1 truncate max-w-full px-4">{file.name}</p>
            <p className="text-[11px] text-cg-muted uppercase">{(file.size / 1000000).toFixed(1)} MB</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="flex-1 bg-cg-background min-h-screen">

        {/* Header */}
        <div className="bg-white border-b border-cg-border pt-12 pb-8 px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl text-cg-dark mb-2">Compare documents</h1>
            <p className="text-[14px] text-cg-muted max-w-xl">
              See what changed between two versions of a legal document. We&apos;ll extract modified clauses, obligations, and deadlines.
            </p>
            <p className="text-[12px] text-cg-muted max-w-xl mt-3">
              Demo use: upload sample or non-confidential documents. Files may be cleared when the demo service restarts.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[12px] font-medium text-cg-green">
              <a href="/samples/service-agreement-v1.txt" download className="underline underline-offset-2">Download sample A</a>
              <a href="/samples/service-agreement-v2.txt" download className="underline underline-offset-2">Download sample B</a>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">

          {(state === "IDLE" || state === "ERROR") && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col md:flex-row gap-6">
                {renderUploader("Document A (Original)", docAFile, fileInputARef, handleFileASelect, () => setDocAFile(null))}
                <div className="hidden md:flex items-center justify-center -mx-3 z-10">
                  <div className="bg-cg-background border border-cg-border rounded-full p-2 text-cg-muted">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
                {renderUploader("Document B (New)", docBFile, fileInputBRef, handleFileBSelect, () => setDocBFile(null))}
              </div>

              {errorMsg && (
                <div className="bg-white border border-cg-attention/30 rounded-xl p-4 flex items-center gap-3 justify-center">
                  <AlertCircle className="size-4 text-cg-attention" />
                  <span className="text-[14px] text-cg-dark font-medium">{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleCompare}
                  disabled={!docAFile || !docBFile}
                  className="bg-cg-dark text-white px-8 h-11 rounded-lg text-[14px] font-medium hover:bg-cg-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Compare documents <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {(state === "UPLOADING" || state === "COMPARING") && (
            <div className="py-24 flex flex-col items-center justify-center animate-in fade-in">
              <div className="size-16 relative mb-8">
                <div className="absolute inset-0 border-[3px] border-cg-border rounded-full" />
                <div className="absolute inset-0 border-[3px] border-cg-green rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="text-[14px] font-bold text-cg-dark mb-4 text-center">
                {state === "UPLOADING" ? "Uploading documents..." : "Analyzing semantic changes..."}
              </p>
              <p className="text-[13px] text-cg-muted">This typically takes 10-15 seconds</p>
            </div>
          )}

          {state === "RESULTS" && result && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

              {/* Executive Summary */}
              <div className="bg-white border border-cg-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">Comparison Summary</h2>
                <p className="text-[16px] text-cg-dark leading-relaxed font-medium">
                  {result.summary}
                </p>

                <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-cg-border">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-1">Modified</p>
                    <p className="text-[20px] font-heading text-cg-dark">{result.changes.filter(c => c.changeType === "modified").length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-1">Added</p>
                    <p className="text-[20px] font-heading text-cg-dark">{result.changes.filter(c => c.changeType === "added").length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-1">Removed</p>
                    <p className="text-[20px] font-heading text-cg-dark">{result.changes.filter(c => c.changeType === "removed").length}</p>
                  </div>
                </div>
              </div>

              {/* Identical check */}
              {result.isIdentical && (
                <div className="bg-cg-green/10 border border-cg-green/20 rounded-xl p-6 text-center">
                  <p className="text-[14px] font-medium text-cg-dark">No textual differences were found in the analyzed content.</p>
                </div>
              )}

              {/* Changes List */}
              {result.changes.length > 0 && (
                <div className="space-y-6">
                  {result.changes.map((change, i) => (
                    <div key={i} className="bg-white border border-cg-border rounded-2xl shadow-sm overflow-hidden">

                      <div className="p-6 border-b border-cg-border bg-cg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                              change.changeType === "modified" ? "bg-cg-accent/10 text-cg-accent" :
                              change.changeType === "added" ? "bg-cg-green/10 text-cg-green" :
                              "bg-cg-attention/10 text-cg-attention"
                            )}>
                              {change.changeType}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cg-muted">{change.category}</span>
                          </div>
                          <h3 className="text-[16px] font-bold text-cg-dark">{change.title}</h3>
                        </div>
                        <p className="text-[13.5px] text-cg-dark md:w-[45%] font-medium leading-relaxed bg-white border border-cg-border p-3 rounded-lg shadow-sm">
                          {change.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-cg-border">
                        {/* Document A Side */}
                        <div className="p-6 bg-cg-background/30">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-4 border-b border-cg-border pb-2 flex items-center gap-2">
                            Document A <span className="font-normal normal-case tracking-normal text-[12px] truncate opacity-50">({result.documentA.filename})</span>
                          </p>
                          {change.documentA ? (
                            <div>
                              <p className="text-[13px] text-cg-dark leading-relaxed font-serif">{change.documentA.text}</p>
                              {change.documentA.source.page && (
                                <span className="inline-block mt-4 text-[10px] font-bold uppercase tracking-wider text-cg-muted bg-white border border-cg-border px-2 py-1 rounded">
                                  Page {change.documentA.source.page}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-[13px] italic text-cg-muted/60 py-4 text-center">Not present in Document A</p>
                          )}
                        </div>

                        {/* Document B Side */}
                        <div className="p-6">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-4 border-b border-cg-border pb-2 flex items-center gap-2">
                            Document B <span className="font-normal normal-case tracking-normal text-[12px] truncate opacity-50">({result.documentB.filename})</span>
                          </p>
                          {change.documentB ? (
                            <div>
                              <p className="text-[13px] text-cg-dark leading-relaxed font-serif">{change.documentB.text}</p>
                              {change.documentB.source.page && (
                                <span className="inline-block mt-4 text-[10px] font-bold uppercase tracking-wider text-cg-muted bg-cg-background border border-cg-border px-2 py-1 rounded">
                                  Page {change.documentB.source.page}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-[13px] italic text-cg-muted/60 py-4 text-center">Removed in Document B</p>
                          )}
                        </div>
                      </div>

                      {/* Obligation Changes */}
                      {change.obligationChanges && change.obligationChanges.length > 0 && (
                        <div className="p-6 border-t border-cg-border bg-cg-background/20">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-cg-muted mb-4">Obligation / Deadline Changes</h4>
                          <div className="space-y-4">
                            {change.obligationChanges.map((obl, idx) => (
                              <div key={idx} className="flex flex-col gap-2 bg-white border border-cg-border p-4 rounded-lg shadow-sm">
                                <span className="text-[13px] font-medium text-cg-dark">{obl.description}</span>
                                {(obl.documentA || obl.documentB) && (
                                  <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-cg-border text-[12px]">
                                    <div className="text-cg-muted"><span className="font-bold">A:</span> {obl.documentA || "-"}</div>
                                    <div className="text-cg-muted"><span className="font-bold">B:</span> {obl.documentB || "-"}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Unchanged Areas */}
                {result.unchangedAreas.length > 0 && (
                  <div className="bg-white border border-cg-border rounded-xl p-6">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-muted mb-4">
                      Unchanged Areas
                    </h4>
                    <ul className="space-y-3">
                      {result.unchangedAreas.map((area, i) => (
                        <li key={i} className="text-[13px] text-cg-dark leading-relaxed flex items-start gap-2">
                          <span className="text-cg-green mt-1">✓</span> {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Professional Questions */}
                {result.professionalQuestions.length > 0 && (
                  <div className="bg-white border border-cg-accent/30 rounded-xl p-6">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cg-accent mb-4">
                      Questions for a Professional
                    </h4>
                    <ul className="space-y-3">
                      {result.professionalQuestions.map((q, i) => (
                        <li key={i} className="text-[13px] text-cg-dark leading-relaxed flex items-start gap-2">
                          <span className="text-cg-accent mt-1">?</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-center pt-8">
                <button
                  onClick={() => {
                    setState("IDLE");
                    setResult(null);
                    setDocAFile(null);
                    setDocBFile(null);
                  }}
                  className="text-[13px] font-medium text-cg-dark hover:text-cg-green underline"
                >
                  Start a new comparison
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
