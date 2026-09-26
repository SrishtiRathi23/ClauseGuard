import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NormalizedDocument } from "../documents/types";
import { analyzeDocument } from "./analyze-document";
import { generateStructuredAnalysis } from "./gemini";

vi.mock("./gemini", () => ({ generateStructuredAnalysis: vi.fn() }));

const doc: NormalizedDocument = {
  id: `doc_${"a".repeat(32)}`,
  fileName: "terms.txt",
  fileType: "txt",
  fileSize: 23,
  rawText: "Payment is due in 30 days.",
  pages: [{ pageNumber: 1, text: "Payment is due in 30 days." }],
  extractedAt: "2026-09-26T00:00:00.000Z",
};

describe("AI document analysis validation", () => {
  beforeEach(() => vi.mocked(generateStructuredAnalysis).mockReset());

  it("keeps real citations and drops invented quotes", async () => {
    vi.mocked(generateStructuredAnalysis).mockResolvedValue(JSON.stringify({
      documentType: "Agreement",
      summary: "Payment terms",
      clauses: [
        { id: "c1", title: "Payment", source: { textQuote: "Payment is due in 30 days." } },
        { id: "c2", title: "Penalty", source: { textQuote: "A late fee of $100 applies." } },
      ],
      obligations: [],
      deadlines: [],
      attentionPoints: [],
    }));

    const result = await analyzeDocument(doc);
    expect(result.clauses[0].source.textQuote).toBe("Payment is due in 30 days.");
    expect(result.clauses[1].source.textQuote).toBeUndefined();
    expect(generateStructuredAnalysis).toHaveBeenCalledWith(expect.stringContaining("[PAGE 1]"));
  });

  it("rejects malformed model responses instead of displaying them", async () => {
    vi.mocked(generateStructuredAnalysis).mockResolvedValue("not JSON");
    await expect(analyzeDocument(doc)).rejects.toThrow();
  });
});
