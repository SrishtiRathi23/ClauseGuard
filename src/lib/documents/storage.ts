import fs from "fs/promises";
import path from "path";
import { del, get, put } from "@vercel/blob";
import { NormalizedDocument } from "./types";

// Local files keep development simple. On Vercel, a private Blob store shares
// documents across independent function invocations on the free Hobby tier.
// All IDs are validated before use in either storage path.

const STORAGE_DIR = path.join(process.cwd(), ".data", "documents");
const ANALYSIS_DIR = path.join(process.cwd(), ".data", "analyses");

function usesBlob(): boolean {
  // A connected Vercel Blob store may authenticate with OIDC instead of a
  // BLOB_READ_WRITE_TOKEN. Let the Blob SDK resolve either credential type.
  return Boolean(process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN);
}

async function saveBlob(folder: "documents" | "analyses", id: string, value: unknown) {
  if (!isValidDocumentId(id)) throw new Error("INVALID_DOCUMENT_ID");
  await put(`${folder}/${id}.json`, JSON.stringify(value), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: folder === "analyses",
  });
}

async function readBlob<T>(folder: "documents" | "analyses", id: string): Promise<T | null> {
  if (!isValidDocumentId(id)) return null;
  const result = await get(`${folder}/${id}.json`, { access: "private", useCache: false });
  if (!result?.stream || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text()) as T;
}

async function removeBlob(folder: "documents" | "analyses", id: string) {
  if (!isValidDocumentId(id)) return;
  await del(`${folder}/${id}.json`);
}

/**
 * Validates that a document ID matches the expected format and cannot
 * be used for path traversal. Document IDs are server-generated as
 * `doc_<32 hex chars>` from crypto.randomUUID().
 *
 * Rejects: ../, ..\, absolute paths, null bytes, special characters.
 */
export function isValidDocumentId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  // Must match: doc_ followed by exactly 32 lowercase hex characters
  return /^doc_[a-f0-9]{32}$/.test(id);
}

/**
 * Safely resolves a file path within a target directory.
 * Throws if the resolved path escapes the intended directory.
 */
function safePath(dir: string, id: string, ext: string): string {
  if (!isValidDocumentId(id)) {
    throw new Error("INVALID_DOCUMENT_ID");
  }
  const resolved = path.resolve(dir, `${id}${ext}`);
  const resolvedDir = path.resolve(dir);
  if (!resolved.startsWith(resolvedDir + path.sep) && resolved !== resolvedDir) {
    throw new Error("PATH_TRAVERSAL_BLOCKED");
  }
  return resolved;
}

// Ensure directories exist
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function saveDocument(doc: NormalizedDocument): Promise<void> {
  if (usesBlob()) return saveBlob("documents", doc.id, doc);
  await ensureDir(STORAGE_DIR);
  const filePath = safePath(STORAGE_DIR, doc.id, ".json");
  await fs.writeFile(filePath, JSON.stringify(doc, null, 2), "utf-8");
}

export async function getDocument(id: string): Promise<NormalizedDocument | null> {
  if (usesBlob()) return readBlob<NormalizedDocument>("documents", id);
  try {
    const filePath = safePath(STORAGE_DIR, id, ".json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as NormalizedDocument;
  } catch {
    return null;
  }
}

export async function deleteDocument(id: string): Promise<void> {
  if (usesBlob()) return removeBlob("documents", id);
  try {
    const filePath = safePath(STORAGE_DIR, id, ".json");
    await fs.unlink(filePath);
  } catch {
    // Ignore if not found or invalid ID
  }
}

// --- Analysis Storage ---

export async function saveAnalysis(documentId: string, analysis: unknown): Promise<void> {
  if (usesBlob()) return saveBlob("analyses", documentId, analysis);
  await ensureDir(ANALYSIS_DIR);
  const filePath = safePath(ANALYSIS_DIR, documentId, ".json");
  await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), "utf-8");
}

export async function getAnalysis(documentId: string): Promise<unknown | null> {
  if (usesBlob()) return readBlob<unknown>("analyses", documentId);
  try {
    const filePath = safePath(ANALYSIS_DIR, documentId, ".json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deleteAnalysis(documentId: string): Promise<void> {
  if (usesBlob()) return removeBlob("analyses", documentId);
  try {
    const filePath = safePath(ANALYSIS_DIR, documentId, ".json");
    await fs.unlink(filePath);
  } catch {
    // Ignore if not found or invalid ID
  }
}
