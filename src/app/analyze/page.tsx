"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload as UploadIcon, FileText, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProcessingState = "IDLE" | "SELECTED" | "UPLOADING" | "EXTRACTING" | "ERROR";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>("IDLE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File) => {
    setErrorMsg(null);
    if (selectedFile.size === 0) {
      setErrorMsg("This document appears to be empty.");
      return false;
    }
    if (selectedFile.size > 4 * 1024 * 1024) {
      setErrorMsg("This file is larger than 4 MiB.\n\nPlease upload a smaller document.");
      return false;
    }
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      setErrorMsg("This file type isn't supported.\n\nUpload a PDF, DOCX or TXT document.");
      return false;
    }
    return true;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setState("SELECTED");
    } else {
      setFile(null);
      setState("ERROR");
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleAnalyze = async () => {
    if (!file) return;
    setState("UPLOADING");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setState("EXTRACTING");

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.error === "EMPTY_DOCUMENT") {
          throw new Error("This document appears to be empty.");
        }
        if (data?.error === "UNSUPPORTED_TYPE") {
          throw new Error("This file type isn't supported.");
        }
        if (data?.error === "FILE_TOO_LARGE") {
          throw new Error("This file is larger than 4 MiB.");
        }
        if (data?.error === "DOCUMENT_TOO_LONG") {
          throw new Error("This document has too much extracted text for the demo (limit: 100,000 characters).");
        }
        if (data?.error === "EXTRACTION_FAILED") {
          throw new Error("The PDF text could not be extracted. Please try the downloadable sample PDF or a text-based PDF.");
        }
        if (data?.error === "STORAGE_FAILED") {
          throw new Error("The document was read, but Vercel Blob could not save it. Check that a Blob store is connected to this project.");
        }
        throw new Error(`Upload failed (HTTP ${res.status}, ${typeof data?.error === "string" ? data.error : "unexpected response"}).`);
      }

      if (!data?.documentId) {
        throw new Error("Upload returned no document ID. Please try again.");
      }
      router.push(`/analyze/${data.documentId}`);
    } catch (err: unknown) {
      setFile(null);
      if (err instanceof Error) {
        setErrorMsg(err.message || "We couldn't process this document.");
      } else {
        setErrorMsg("We couldn't process this document.");
      }
      setState("ERROR");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl text-center mb-10">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-4">
          STEP 1 OF 1
        </p>
        <h1 className="font-heading text-4xl text-cg-dark mb-4">
          Upload your document
        </h1>
        <p className="text-[14px] text-cg-muted leading-relaxed max-w-md mx-auto">
          Add a legal document and ClauseGuard will turn it into plain-language insights.
        </p>
        <p className="text-[12px] text-cg-muted leading-relaxed max-w-md mx-auto mt-4">
          Demo use: upload a fictional sample or non-confidential document. This prototype has no private user accounts.
        </p>
        <a href="/samples/service-agreement-v1.pdf" download className="inline-block mt-3 text-[12px] font-medium text-cg-green underline underline-offset-2">
          Download a fictional sample agreement (PDF)
        </a>
      </div>

      <div className="w-full max-w-xl">
        <div
          className={cn(
            "border border-dashed rounded-xl p-12 text-center transition-colors relative",
            state === "IDLE" ? "border-cg-border/80 bg-white hover:border-cg-green/50 hover:bg-cg-background/50 cursor-pointer" : "border-cg-border bg-white"
          )}
          onDragOver={state === "IDLE" ? onDragOver : undefined}
          onDrop={state === "IDLE" ? onDrop : undefined}
          onClick={() => state === "IDLE" && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />

          {state === "IDLE" && (
            <div className="flex flex-col items-center pointer-events-none">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cg-background border border-cg-border mb-5">
                <UploadIcon className="size-5 text-cg-dark" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-bold text-cg-dark mb-2">Drop your document here</p>
              <p className="text-[12px] text-cg-muted mb-6">PDF, DOCX or TXT (Max 4 MiB)</p>
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-cg-border text-cg-dark bg-white hover:bg-cg-background px-6 h-9 text-[13px] font-medium rounded-lg pointer-events-auto"
                )}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse files
              </button>
            </div>
          )}

          {state === "SELECTED" && file && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => { setFile(null); setState("IDLE"); setErrorMsg(null); }}
                className="absolute top-4 right-4 p-2 text-cg-muted hover:text-cg-dark hover:bg-cg-background rounded-full transition-colors"
                aria-label="Remove file"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cg-green/10 mb-4">
                <FileText className="size-5 text-cg-green" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-medium text-cg-dark mb-1 truncate max-w-full px-8">{file.name}</p>
              <p className="text-[12px] text-cg-muted mb-6 uppercase">
                {file.name.split('.').pop()} &middot; {(file.size / 1000000).toFixed(1)} MB
              </p>
              <div className="flex items-center gap-2 text-[12px] font-medium text-cg-green mb-8">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ready to analyze
              </div>
              <button
                onClick={handleAnalyze}
                className={cn(
                  buttonVariants(),
                  "bg-cg-dark hover:bg-cg-dark/90 text-white px-8 h-10 text-[13px] font-medium rounded-lg shadow-sm w-auto transition-all"
                )}
              >
                Analyze document &rarr;
              </button>
            </div>
          )}

          {(state === "UPLOADING" || state === "EXTRACTING") && (
            <div role="status" aria-live="polite" className="flex flex-col items-center py-6 text-left w-full max-w-[240px] mx-auto">
              <p className="text-[14px] font-bold text-cg-dark mb-6 text-center w-full">Preparing your document</p>
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 text-[13px] text-cg-dark">
                  <svg className="size-4 text-cg-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>File received</span>
                </div>
                <div className={cn("flex items-center gap-3 text-[13px]", state === "EXTRACTING" ? "text-cg-dark" : "text-cg-muted")}>
                  {state === "EXTRACTING" ? (
                    <svg className="size-4 text-cg-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <div className="size-4 rounded-full bg-cg-green/20 border border-cg-green flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-cg-green animate-pulse" />
                    </div>
                  )}
                  <span>Reading document</span>
                </div>
                <div className={cn("flex items-center gap-3 text-[13px]", state === "EXTRACTING" ? "text-cg-dark" : "text-cg-muted/50")}>
                  {state === "EXTRACTING" ? (
                    <div className="size-4 rounded-full bg-cg-green/20 border border-cg-green flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-cg-green animate-pulse" />
                    </div>
                  ) : (
                    <div className="size-4 rounded-full border border-cg-border" />
                  )}
                  <span>Preparing document</span>
                </div>
              </div>
            </div>
          )}

          {state === "ERROR" && (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cg-attention/10 mb-4">
                <X className="size-5 text-cg-attention" strokeWidth={2} />
              </div>
              <p role="alert" className="text-[14px] font-bold text-cg-dark mb-3 whitespace-pre-line">
                {errorMsg}
              </p>
              <button
                onClick={() => { setState("IDLE"); setErrorMsg(null); }}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 border-cg-border text-cg-dark bg-white hover:bg-cg-background px-6 h-9 text-[13px] font-medium rounded-lg"
                )}
              >
                Try another document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
