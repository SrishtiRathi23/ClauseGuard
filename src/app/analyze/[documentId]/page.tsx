"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { NormalizedDocument } from "@/lib/documents/types";
import { DocumentAnalysis } from "@/lib/ai/schemas";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { AnalysisMetrics } from "@/components/analysis/AnalysisMetrics";
import { OverviewTab } from "@/components/analysis/OverviewTab";
import { ClauseExplorer } from "@/components/analysis/ClauseExplorer";
import { ObligationMap } from "@/components/analysis/ObligationMap";
import { ScenarioLab } from "@/components/analysis/ScenarioLab";
import { ReviewBrief } from "@/components/analysis/ReviewBrief";
import { DocumentQA } from "@/components/analysis/DocumentQA";
import { ExtractedTextViewer } from "@/components/analysis/ExtractedTextViewer";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DocumentWorkspacePage({ params }: { params: Promise<{ documentId: string }> }) {
  const router = useRouter();
  const { documentId } = use(params);

  const [doc, setDoc] = useState<NormalizedDocument | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<{ type: string, message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"Overview" | "Clauses" | "Obligations" | "Scenarios" | "Questions" | "QA">("Overview");
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [targetPage, setTargetPage] = useState<number | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/analyze`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "CONFIGURATION_ERROR") throw new Error("CONFIGURATION_ERROR");
        if (data.error === "QUOTA_EXCEEDED") throw new Error("QUOTA_EXCEEDED");
        throw new Error("ANALYSIS_FAILED");
      }

      setAnalysis(data);
      if (data.clauses && data.clauses.length > 0) {
        setSelectedClauseId(data.clauses[0].id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "CONFIGURATION_ERROR") {
          setError({ type: "Config", message: "The AI service is not configured properly (Missing API Key)." });
        } else if (err.message === "QUOTA_EXCEEDED") {
          setError({ type: "Quota", message: "Analysis is temporarily unavailable because the AI usage limit has been reached." });
        } else {
          setError({ type: "General", message: "We couldn't complete the analysis.\nYour document was successfully read, but the AI analysis could not be completed." });
        }
      } else {
        setError({ type: "General", message: "We couldn't complete the analysis. Please try again later." });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  useEffect(() => {
    async function init() {
      if (!documentId) return;
      try {
        const docRes = await fetch(`/api/documents/${documentId}`);
        if (!docRes.ok) throw new Error("DOCUMENT_NOT_FOUND");
        const docData = await docRes.json();
        setDoc(docData);

        const analysisRes = await fetch(`/api/documents/${documentId}/analyze`);
        if (analysisRes.ok) {
          const analysisData = await analysisRes.json();
          setAnalysis(analysisData);
          if (analysisData.clauses && analysisData.clauses.length > 0) {
            setSelectedClauseId(analysisData.clauses[0].id);
          }
        } else {
          startAnalysis();
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "DOCUMENT_NOT_FOUND") {
          setError({ type: "NotFound", message: "This document could not be found or has expired." });
        } else {
          setError({ type: "General", message: "An unexpected error occurred while loading the workspace." });
        }
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, [documentId, startAnalysis]);

  // Loading animation sequencer
  useEffect(() => {
    if (!isAnalyzing) return;
    const stages = [0, 1, 2, 3, 4];
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % stages.length;
      if (current < 4) setLoadingStage(current); // stop advancing visually near the end
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleSourceClick = useCallback((page: number) => {
    setShowRaw(true);
    setTargetPage(page);
  }, []);

  const handleNavigateToClause = useCallback((clauseId: string) => {
    setSelectedClauseId(clauseId);
    setActiveTab("Clauses");
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-cg-background flex items-center justify-center">
        <div className="size-6 rounded-full border-2 border-cg-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="size-12 rounded-full bg-cg-attention/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-6 text-cg-attention" />
          </div>
          <p className="text-[15px] font-medium text-cg-dark whitespace-pre-wrap">{error.message}</p>
          <div className="pt-4 flex flex-col gap-3">
            {error.type === "Quota" && (
              <button onClick={() => startAnalysis()} className="w-full py-2.5 bg-cg-green text-white rounded-lg text-[14px] font-medium hover:bg-cg-green/90 transition-colors">
                Try again
              </button>
            )}
            <button onClick={() => router.push("/analyze")} className="w-full py-2.5 bg-white border border-cg-border text-cg-dark rounded-lg text-[14px] font-medium hover:bg-cg-background transition-colors">
              Upload a different document
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="min-h-screen bg-cg-background pb-20">

      {/* Top Nav */}
      <nav className="bg-white border-b border-cg-border sticky top-0 z-40 print:hidden">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/analyze" className="flex items-center gap-2 text-cg-dark hover:text-cg-green transition-colors">
            <ArrowLeft className="size-4" />
            <span className="text-[13px] font-bold tracking-widest uppercase">ClauseGuard</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[13px] font-medium overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("Overview")}
              className={cn("h-14 border-b-2 transition-colors whitespace-nowrap", activeTab === "Overview" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted hover:text-cg-dark")}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("Clauses")}
              className={cn("h-14 border-b-2 transition-colors whitespace-nowrap", activeTab === "Clauses" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted hover:text-cg-dark")}
            >
              Clause Explorer
            </button>
            <button
              onClick={() => setActiveTab("Obligations")}
              className={cn("h-14 border-b-2 transition-colors whitespace-nowrap", activeTab === "Obligations" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted hover:text-cg-dark")}
            >
              Obligations
            </button>
            <button
              onClick={() => setActiveTab("Scenarios")}
              className={cn("h-14 border-b-2 transition-colors whitespace-nowrap", activeTab === "Scenarios" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted hover:text-cg-dark")}
            >
              Scenarios
            </button>
            <button
              onClick={() => setActiveTab("Questions")}
              className={cn("h-14 border-b-2 transition-colors whitespace-nowrap", activeTab === "Questions" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted hover:text-cg-dark")}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab("QA")}
              className={cn("h-14 border-b-2 transition-colors whitespace-nowrap", activeTab === "QA" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted hover:text-cg-dark")}
            >
              Q&A
            </button>
            <Link href="/compare" className="h-14 border-b-2 border-transparent text-cg-muted hover:text-cg-dark whitespace-nowrap flex items-center">
              Compare
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-12">

        {isAnalyzing || !analysis ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="size-16 relative mb-8">
              <div className="absolute inset-0 border-[3px] border-cg-border rounded-full" />
              <div className="absolute inset-0 border-[3px] border-cg-green rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-[14px] font-bold text-cg-dark mb-8 text-center w-full">Understanding your document</p>
            <div className="space-y-5 w-full max-w-[240px]">
              {["Reading document", "Identifying sections", "Extracting clauses", "Preparing your review"].map((label, i) => (
                <div key={label} className={cn("flex items-center gap-3 text-[13px]", loadingStage >= i ? "text-cg-dark" : "text-cg-muted")}>
                  {loadingStage > i ? (
                    <svg className="size-4 text-cg-green shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : loadingStage === i ? (
                    <div className="size-4 rounded-full bg-cg-green/20 border border-cg-green flex items-center justify-center shrink-0">
                      <div className="size-1.5 rounded-full bg-cg-green animate-pulse" />
                    </div>
                  ) : (
                    <div className="size-4 rounded-full border border-cg-border shrink-0" />
                  )}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab !== "Scenarios" && (
              <AnalysisHeader
                doc={doc}
                analysis={analysis}
                onViewText={() => {
                  setShowRaw(!showRaw);
                  if (!showRaw) setTargetPage(null);
                }}
              />
            )}

            {/* Mobile Tab Select */}
            <div className="md:hidden mb-8 border-b border-cg-border flex gap-4 text-[14px] font-medium overflow-x-auto hide-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 print:hidden">
              <button
                onClick={() => setActiveTab("Overview")}
                className={cn("pb-3 border-b-2 whitespace-nowrap", activeTab === "Overview" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted")}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("Clauses")}
                className={cn("pb-3 border-b-2 whitespace-nowrap", activeTab === "Clauses" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted")}
              >
                Explorer
              </button>
              <button
                onClick={() => setActiveTab("Obligations")}
                className={cn("pb-3 border-b-2 whitespace-nowrap", activeTab === "Obligations" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted")}
              >
                Obligations
              </button>
              <button
                onClick={() => setActiveTab("Scenarios")}
                className={cn("pb-3 border-b-2 whitespace-nowrap", activeTab === "Scenarios" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted")}
              >
                Scenarios
              </button>
              <button
                onClick={() => setActiveTab("Questions")}
                className={cn("pb-3 border-b-2 whitespace-nowrap", activeTab === "Questions" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted")}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab("QA")}
                className={cn("pb-3 border-b-2 whitespace-nowrap", activeTab === "QA" ? "border-cg-green text-cg-dark" : "border-transparent text-cg-muted")}
              >
                Q&A
              </button>
            </div>

            {activeTab === "Overview" ? (
              <>
                <AnalysisMetrics analysis={analysis} />
                <OverviewTab
                  analysis={analysis}
                  onNavigateToClauses={() => setActiveTab("Clauses")}
                  onNavigateToQA={() => setActiveTab("QA")}
                  onSourceClick={handleSourceClick}
                />
              </>
            ) : activeTab === "Clauses" ? (
              <ClauseExplorer
                analysis={analysis}
                onSourceClick={handleSourceClick}
                selectedClauseId={selectedClauseId}
                onSelectClause={setSelectedClauseId}
              />
            ) : activeTab === "Obligations" ? (
              <ObligationMap
                analysis={analysis}
                onSourceClick={handleSourceClick}
                onNavigateToClause={handleNavigateToClause}
              />
            ) : activeTab === "Scenarios" ? (
              <ScenarioLab
                documentId={documentId}
                onSourceClick={handleSourceClick}
                onNavigateToClause={handleNavigateToClause}
              />
            ) : activeTab === "Questions" ? (
              <ReviewBrief
                documentId={documentId}
                docTitle={doc.fileName}
                analysis={analysis}
                onSourceClick={handleSourceClick}
                onNavigateToClause={handleNavigateToClause}
              />
            ) : (
              <DocumentQA
                documentId={documentId}
                docTitle={doc.fileName}
                analysis={analysis}
                onSourceClick={handleSourceClick}
                onNavigateToClause={handleNavigateToClause}
              />
            )}

            <div className="pt-12 mt-12 text-center border-t border-cg-border print:hidden">
              <p className="text-[12px] font-medium text-cg-muted">
                ClauseGuard provides document-based legal information and assistance.
                <br />
                It does not replace a qualified legal professional.
              </p>
            </div>
          </div>
        )}

        <ExtractedTextViewer
          pages={doc.pages || []}
          isOpen={showRaw}
          onToggle={() => setShowRaw(!showRaw)}
          targetPage={targetPage}
        />

      </div>
    </div>
  );
}
