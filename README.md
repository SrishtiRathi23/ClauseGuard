# ClauseGuard

**Understand what you sign. See what happens next.**

ClauseGuard is a GenAI-powered hackathon demo for understanding and comparing legal-style documents. Users upload PDF, DOCX, or TXT files, then explore a plain-language summary, clauses, obligations, deadlines, what-if scenarios, document Q&A, and questions to take to a qualified legal professional.

## PromptWars challenge fit

The challenge is AI for Legal Assistance & Access. ClauseGuard helps users understand and compare documents, identify stated duties and timelines, and prepare for professional review. It provides document-based information and assistance, not legal advice or a decision about whether a document is lawful or should be signed.

## GenAI architecture

- The browser uploads a document to a Next.js API route.
- The server extracts text with pdf2json for PDF, mammoth for DOCX, or UTF-8 decoding for TXT.
- The server sends document text and a feature-specific prompt to Gemini 2.5 Flash through @google/genai. GEMINI_API_KEY stays on the server; GEMINI_MODEL can override the model.
- Zod checks response structure. Quote checks compare returned citations with the uploaded text before results reach the UI.
- Analysis is cached on the demo server. Scenario analysis, Q&A, professional questions and non-identical comparison make Gemini calls only after a user action. Identical comparison uses a deterministic bypass.
- No external search, vector database, embeddings or RAG service is used.

## Try the demo

A name is requested only for a local browser demo session; there is no real account or password. The upload page includes a fictional sample agreement. The compare page includes two fictional versions. Download a sample, select it in the file picker, and run the analysis or comparison. Do not upload confidential or real client documents to the public hackathon demo.

The hosted demo uses temporary local files for a few evaluators. Files and analyses can disappear when the service restarts; re-upload the sample if a link expires. Document IDs are randomly generated. This is a small evaluation prototype, not a private document vault.

## Local setup

Requirements: Node.js 22, npm, and a Gemini API key.

1. Install dependencies: npm ci
2. Copy .env.example to .env.local and set GEMINI_API_KEY.
3. Start locally: npm run dev
4. Open http://localhost:3000

Checks: npm run lint and npm run build.

## Hackathon submission

See HACKATHON_SUBMISSION.md for the project description, GenAI mapping, live link, repository link, and short video outline. The repository must be public and below 10 MB; the demo video must be strictly under four minutes and show data entered live.

## Hosting

Cloud Run is used for this demo because its request limit supports the current 10 MiB upload. The service is capped at one instance and stores files only in that instance. This avoids adding a database or object store for two or three evaluators. The instance can restart and lose data. The Gemini key must be configured as a server-side secret. No .env.local or uploaded documents should be committed or included in the Cloud Run source upload.
