import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractDocument } from "./extract";

describe("document extraction", () => {
  it("reads the PDF used by the deployed demo", async () => {
    const pdf = readFileSync(path.join(process.cwd(), "public/samples/service-agreement-v1.pdf"));
    const document = await extractDocument(pdf, "sample.pdf", "pdf", pdf.length);

    expect(document.rawText).toContain("Agreement");
    expect(document.pages?.length).toBeGreaterThan(0);
    expect(document.pages?.[0].pageNumber).toBe(1);
    expect(document.id).toMatch(/^[a-f0-9]{32}$/);
  });

  it("reads text documents and rejects empty or oversized extracted text", async () => {
    const content = Buffer.from("Payment is due in 30 days.\n\nEither party may terminate.");
    const document = await extractDocument(content, "terms.txt", "txt", content.length);
    expect(document.pages).toHaveLength(2);
    expect(document.rawText).toContain("Payment is due");

    await expect(extractDocument(Buffer.from("  "), "empty.txt", "txt", 2))
      .rejects.toThrow("EMPTY_DOCUMENT");
    await expect(extractDocument(Buffer.from("a".repeat(100_001)), "long.txt", "txt", 100_001))
      .rejects.toThrow("DOCUMENT_TOO_LONG");
  });
});
