# PromptWars: Virtual (Exclusive Edition) submission

Challenge: AI for Legal Assistance & Access

## Submission links

- Deployed prototype: add the verified Vercel URL after deployment.
- Public GitHub repository: https://github.com/SrishtiRathi23/ClauseGuard
- Demo video: add the uploaded video link after recording. It must be strictly under four minutes.

## Project description

ClauseGuard helps people understand what a legal-style document says before they discuss it with a professional. A user uploads a PDF, DOCX or TXT agreement and gets a plain-language overview, searchable clauses, a map of obligations and deadlines, document-grounded what-if exploration, Q&A, and a brief of questions for a lawyer. Two versions can be compared to surface added, removed and changed provisions. The tool is designed for legal information and preparation, not legal advice or a sign/don't-sign recommendation.

## Where GenAI is used

| Feature | Gemini integration |
| --- | --- |
| Document analysis | Server-side Gemini 2.5 Flash-Lite extracts the summary, parties, clauses, duties, deadlines and attention points from uploaded text. |
| Scenario Lab | Gemini traces the uploaded document's conditions, stated consequences and missing information for a user-entered scenario. |
| Document Q&A | Gemini answers a user-entered question with answer status and source quotes from the uploaded document. |
| Comparison | Gemini identifies semantic changes between two uploaded versions; identical text bypasses the AI call. |
| Professional questions | Gemini drafts document-specific questions to discuss with a qualified legal professional. |

The application uses Vercel-hosted Next.js API routes, private Vercel Blob storage for extracted documents and cached analyses, @google/genai, JSON output, Zod response schemas and quote checks. The Gemini API key remains server-side. It does not use external search, embeddings, a vector database or a RAG service.

## Video outline — aim for 3 minutes 30 seconds

1. **0:00–0:20:** Introduce the access-to-legal-information problem and the legal-information boundary.
2. **0:20–0:45:** Open the live URL, enter a demo name on screen, download the fictional sample and upload it through the file picker. Do not use a pre-filled form.
3. **0:45–1:25:** Show newly generated overview, clause explanation, obligation and source quote.
4. **1:25–2:05:** Type a what-if scenario or question live, submit, and show dynamic Gemini output with citations.
5. **2:05–2:35:** Generate professional questions; show copy and print options.
6. **2:35–3:15:** Download both sample versions, upload them live in Compare, and show changed notice/payment terms plus an added and removed provision.
7. **3:15–3:30:** State that ClauseGuard provides document-based assistance and points users toward qualified professional review.

Keep the actual recording strictly under 4:00. Use real clicks and live input; do not insert static result screens or pre-filled forms. Show the deployed URL in the browser.

## Final submission check

- [ ] Public URL opens without a host login
- [ ] Sample upload, analysis, Q&A, scenario, questions and comparison work on the deployed URL
- [x] GitHub repository is public, includes source, and is below 10 MB
- [ ] Project description pasted into the submission form
- [ ] Gemini architecture mapping pasted into the submission form
- [ ] Video link opens and runtime is strictly below four minutes
- [ ] Video shows live data entry and dynamic GenAI output
