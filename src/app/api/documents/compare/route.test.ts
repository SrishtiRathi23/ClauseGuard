import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDocument } from "@/lib/documents/storage";
import { analyzeComparison } from "@/lib/ai/analyze-comparison";
import { POST } from "./route";

vi.mock("@/lib/documents/storage", () => ({
  isValidDocumentId: (id: string) => /^doc_[a-f0-9]{32}$/.test(id),
  getDocument: vi.fn(),
}));
vi.mock("@/lib/ai/analyze-comparison", () => ({ analyzeComparison: vi.fn() }));

const idA = `doc_${"a".repeat(32)}`;
const idB = `doc_${"b".repeat(32)}`;
const request = (body: unknown) => new Request("http://localhost/api/documents/compare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("comparison API", () => {
  beforeEach(() => vi.resetAllMocks());

  it("validates both document IDs before storage access", async () => {
    const missing = await POST(request({ documentAId: idA }));
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ error: "MISSING_DOCUMENTS" });

    const invalid = await POST(request({ documentAId: "../secret", documentBId: idB }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toEqual({ error: "INVALID_DOCUMENT_ID" });
    expect(getDocument).not.toHaveBeenCalled();
  });

  it("returns 404 if either document is missing", async () => {
    vi.mocked(getDocument).mockResolvedValueOnce({ id: idA } as never).mockResolvedValueOnce(null);
    const response = await POST(request({ documentAId: idA, documentBId: idB }));
    expect(response.status).toBe(404);
    expect(analyzeComparison).not.toHaveBeenCalled();
  });

  it("compares both loaded documents", async () => {
    const a = { id: idA, rawText: "old" };
    const b = { id: idB, rawText: "new" };
    vi.mocked(getDocument).mockResolvedValueOnce(a as never).mockResolvedValueOnce(b as never);
    vi.mocked(analyzeComparison).mockResolvedValue({ summary: "Changed", changes: [] } as never);
    const response = await POST(request({ documentAId: idA, documentBId: idB }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ summary: "Changed", changes: [] });
    expect(analyzeComparison).toHaveBeenCalledWith(a, b);
  });
});
