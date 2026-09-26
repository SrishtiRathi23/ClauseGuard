import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getAnalysis, getDocument, saveAnalysis } from "@/lib/documents/storage";
import { analyzeDocument } from "@/lib/ai/analyze-document";
import { GET, POST } from "./route";

vi.mock("@/lib/documents/storage", () => ({
  isValidDocumentId: (id: string) => /^doc_[a-f0-9]{32}$/.test(id),
  getAnalysis: vi.fn(),
  getDocument: vi.fn(),
  saveAnalysis: vi.fn(),
}));
vi.mock("@/lib/ai/analyze-document", () => ({ analyzeDocument: vi.fn() }));

const id = `doc_${"a".repeat(32)}`;
const request = () => new NextRequest(`http://localhost/api/documents/${id}/analyze`, { method: "POST" });
const context = (documentId = id) => ({ params: Promise.resolve({ documentId }) });

describe("analysis API", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects invalid IDs before reading storage", async () => {
    const response = await POST(request(), context("../secret"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_DOCUMENT_ID" });
    expect(getDocument).not.toHaveBeenCalled();
  });

  it("returns a saved analysis without calling Gemini again", async () => {
    const saved = { summary: "Stored analysis", clauses: [] };
    vi.mocked(getAnalysis).mockResolvedValue(saved);
    const response = await POST(request(), context());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(saved);
    expect(getDocument).not.toHaveBeenCalled();
    expect(analyzeDocument).not.toHaveBeenCalled();
  });

  it("analyzes and saves a document once", async () => {
    const doc = { id, rawText: "Payment due in 30 days." };
    const analysis = { summary: "Payment terms", clauses: [] };
    vi.mocked(getAnalysis).mockResolvedValue(null);
    vi.mocked(getDocument).mockResolvedValue(doc as never);
    vi.mocked(analyzeDocument).mockResolvedValue(analysis as never);
    const response = await POST(request(), context());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(analysis);
    expect(analyzeDocument).toHaveBeenCalledWith(doc);
    expect(saveAnalysis).toHaveBeenCalledWith(id, analysis);
  });

  it("returns a 404 for missing documents and a 429 for Gemini quota", async () => {
    vi.mocked(getAnalysis).mockResolvedValue(null);
    vi.mocked(getDocument).mockResolvedValueOnce(null);
    expect((await POST(request(), context())).status).toBe(404);

    vi.mocked(getDocument).mockResolvedValue({ id, rawText: "text" } as never);
    vi.mocked(analyzeDocument).mockRejectedValue(new Error("QUOTA_EXCEEDED"));
    const response = await POST(request(), context());
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "QUOTA_EXCEEDED" });
  });

  it("returns stored analysis through GET and 404 when absent", async () => {
    vi.mocked(getAnalysis).mockResolvedValueOnce({ summary: "Saved" }).mockResolvedValueOnce(null);
    const found = await GET(request(), context());
    expect(found.status).toBe(200);
    expect(await found.json()).toEqual({ summary: "Saved" });
    expect((await GET(request(), context())).status).toBe(404);
  });
});
