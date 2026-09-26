import { describe, expect, it } from "vitest";
import { isValidDocumentId } from "./storage";

describe("document ID validation", () => {
  it("accepts only generated IDs and blocks path traversal", () => {
    expect(isValidDocumentId(`doc_${"a".repeat(32)}`)).toBe(true);
    for (const value of ["../secrets", "doc_../../secrets", `doc_${"G".repeat(32)}`, "doc_short", "", "doc_abc\\file"]) {
      expect(isValidDocumentId(value)).toBe(false);
    }
  });
});
