import fs from "fs/promises";
import path from "path";
import { NormalizedDocument } from "./types";

// NOTE: This uses local filesystem storage for Phase 2 prototyping.
// When deployed to a serverless environment like Cloud Run, the local filesystem
// is ephemeral and data will be lost on container restart.
// For production, this should be swapped out with a managed storage solution (e.g., GCS + Postgres).
//
// SECURITY NOTE: All document/analysis IDs are validated against a strict pattern
// before being used in filesystem paths. This prevents path traversal attacks
// such as ../../etc/passwd or ..\secret from escaping the storage directory.

const STORAGE_DIR = path.join(process.cwd(), ".data", "documents");
const ANALYSIS_DIR = path.join(process.cwd(), ".data", "analyses");

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
  await ensureDir(STORAGE_DIR);
  const filePath = safePath(STORAGE_DIR, doc.id, ".json");
  await fs.writeFile(filePath, JSON.stringify(doc, null, 2), "utf-8");
}

export async function getDocument(id: string): Promise<NormalizedDocument | null> {
  try {
    const filePath = safePath(STORAGE_DIR, id, ".json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as NormalizedDocument;
  } catch {
    return null;
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const filePath = safePath(STORAGE_DIR, id, ".json");
    await fs.unlink(filePath);
  } catch {
    // Ignore if not found or invalid ID
  }
}

// --- Analysis Storage ---

export async function saveAnalysis(documentId: string, analysis: unknown): Promise<void> {
  await ensureDir(ANALYSIS_DIR);
  const filePath = safePath(ANALYSIS_DIR, documentId, ".json");
  await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), "utf-8");
}

export async function getAnalysis(documentId: string): Promise<unknown | null> {
  try {
    const filePath = safePath(ANALYSIS_DIR, documentId, ".json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function deleteAnalysis(documentId: string): Promise<void> {
  try {
    const filePath = safePath(ANALYSIS_DIR, documentId, ".json");
    await fs.unlink(filePath);
  } catch {
    // Ignore if not found or invalid ID
  }
}
