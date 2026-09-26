import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { saveDocument } from "@/lib/documents/storage";
import { POST } from "./route";

vi.mock("@/lib/documents/storage", () => ({ saveDocument: vi.fn() }));

function upload(file?: File) {
  const body = new FormData();
  if (file) body.append("file", file);
  return new NextRequest("http://localhost/api/documents/upload", { method: "POST", body });
}

describe("upload API", () => {
  beforeEach(() => vi.resetAllMocks());

  it("validates absent, empty, unsupported, and oversized files", async () => {
    const cases: Array<[File | undefined, string]> = [
      [undefined, "No file provided"],
      [new File([], "empty.txt", { type: "text/plain" }), "EMPTY_DOCUMENT"],
      [new File(["data"], "photo.png", { type: "image/png" }), "UNSUPPORTED_TYPE"],
      [new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.txt", { type: "text/plain" }), "FILE_TOO_LARGE"],
    ];
    for (const [file, error] of cases) {
      const response = await POST(upload(file));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error });
    }
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it("extracts and stores the real sample PDF, returning metadata only", async () => {
    const bytes = readFileSync(path.join(process.cwd(), "public/samples/service-agreement-v1.pdf"));
    const response = await POST(upload(new File([bytes], "sample.pdf", { type: "application/pdf" })));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.documentId).toMatch(/^doc_[a-f0-9]{32}$/);
    expect(body.fileType).toBe("pdf");
    expect(body.textLength).toBeGreaterThan(100);
    expect(body).not.toHaveProperty("rawText");
    expect(saveDocument).toHaveBeenCalledWith(expect.objectContaining({
      id: body.documentId,
      fileName: "sample.pdf",
      fileType: "pdf",
    }));
  });

  it("returns a specific error when storage fails after extraction", async () => {
    vi.mocked(saveDocument).mockRejectedValue(new Error("storage unavailable"));
    const response = await POST(upload(new File(["A valid contract"], "terms.txt", { type: "text/plain" })));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "STORAGE_FAILED" });
  });
});
