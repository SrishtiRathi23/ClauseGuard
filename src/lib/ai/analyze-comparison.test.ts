import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NormalizedDocument } from "../documents/types";
import { analyzeComparison } from "./analyze-comparison";
import { generateStructuredAnalysis } from "./gemini";

vi.mock("./gemini", () => ({ generateStructuredAnalysis: vi.fn() }));

const document = (rawText: string, fileName: string): NormalizedDocument => ({
  id: `doc_${"a".repeat(32)}`,
  fileName,
  fileType: "txt",
  fileSize: rawText.length,
  rawText,
  extractedAt: "2026-09-26T00:00:00.000Z",
});

describe("document comparison", () => {
  beforeEach(() => vi.mocked(generateStructuredAnalysis).mockReset());

  it("returns an identical result without spending a Gemini request", async () => {
    const result = await analyzeComparison(
      document("Payment due in 30 days.", "one.txt"),
      document("Payment   due in 30 days.\n", "two.txt"),
    );
    expect(result.isIdentical).toBe(true);
    expect(result.changes).toEqual([]);
    expect(generateStructuredAnalysis).not.toHaveBeenCalled();
  });

  it("checks quotes against the correct version and retains real quotes", async () => {
    vi.mocked(generateStructuredAnalysis).mockResolvedValue(JSON.stringify({
      documentA: { filename: "fabricated-a.txt" },
      documentB: { filename: "fabricated-b.txt" },
      summary: "The payment term changed.",
      isIdentical: false,
      changes: [{
        changeType: "modified",
        category: "payment",
        title: "Payment deadline",
        summary: "A longer period is allowed.",
        significance: "review",
        documentA: { text: "Pay in 10 days", source: { textQuote: "Pay in 10 days" } },
        documentB: { text: "Pay in 30 days", source: { textQuote: "Invented penalty" } },
      }],
    }));

    const result = await analyzeComparison(
      document("Pay in 10 days", "original.txt"),
      document("Pay in 30 days", "revised.txt"),
    );
    expect(result.documentA.filename).toBe("original.txt");
    expect(result.documentB.filename).toBe("revised.txt");
    expect(result.changes[0].documentA?.source.textQuote).toBe("Pay in 10 days");
    expect(result.changes[0].documentB?.source.textQuote).toBeUndefined();
    expect(generateStructuredAnalysis).toHaveBeenCalledOnce();
  });
});
