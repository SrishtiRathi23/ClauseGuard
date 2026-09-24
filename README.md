# ClauseGuard

**Understand what you sign. See what happens next.**

ClauseGuard is a GenAI-powered hackathon demo for understanding and comparing legal-style documents. Users upload PDF, DOCX, or TXT files, then explore a plain-language summary, clauses, obligations, deadlines, what-if scenarios, document Q&A, and questions to take to a qualified legal professional.

## PromptWars challenge fit

The challenge is AI for Legal Assistance & Access. ClauseGuard helps users understand and compare documents, identify stated duties and timelines, and prepare for professional review. It provides document-based information and assistance, not legal advice or a decision about whether a document is lawful or should be signed.

## GenAI architecture

- The browser uploads a document to a Next.js API route.
- The server extracts text with pdf2json for PDF, mammoth for DOCX, or UTF-8 decoding for TXT.
- The server sends document text and a feature-specific prompt to Gemini 2.5 Flash-Lite through @google/genai. GEMINI_API_KEY stays on the server; GEMINI_MODEL can override the model. The free-tier request quota is limited, so the demo may show a quota message after heavy testing.
- Zod checks response structure. Quote checks compare returned citations with the uploaded text before results reach the UI.
- Analysis is saved with the document in a private Vercel Blob store on the hosted demo. Local development uses `.data/` files. Scenario analysis, Q&A, professional questions and non-identical comparison make Gemini calls only after a user action. Identical comparison uses a deterministic bypass.
- No external search, vector database, embeddings or RAG service is used.

## Try the demo

A name is requested only for a local browser demo session; there is no real account or password. The upload page includes a fictional sample agreement. The compare page includes two fictional versions. Download a sample, select it in the file picker, and run the analysis or comparison. Files are capped at 4 MiB and extracted text at 100,000 characters. Do not upload confidential or real client documents to the public hackathon demo.

The hosted demo stores extracted text and analyses in a private Vercel Blob store so separate functions can read the same data. Document IDs are randomly generated, but there is no account-based access control. This is a small evaluation prototype, not a private document vault. Demo files remain in the Blob store until deleted by the maintainer.

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

Vercel Hobby is the intended free host for this personal hackathon demo. Connect this GitHub repository, create a **private** Vercel Blob store for the project, and set `GEMINI_API_KEY` as a server-side environment variable. Connecting the Blob store supplies `BLOB_READ_WRITE_TOKEN`. The server uses that token for document storage; without it, hosted uploads fail. Use a Gemini API key from a free-tier project to avoid AI charges. Hobby and Blob have free usage limits; reaching them can pause service until limits reset. Do not commit `.env.local` or uploaded documents.
