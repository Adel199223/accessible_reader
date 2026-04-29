# Stage 958 - Source Learning Exports After Stage 957

## Status

Completed on 2026-04-28.

## Intent

Make the now-connected local Reader, Source memory, Notebook, Graph, and Study loop portable by adding a rich source-level learning pack export and surfacing full workspace backup from Home. This follows Recall's export direction while staying local-first and preserving Stage 956/957 Reader-led source quiz launch.

## Scope

- Add `GET /api/recall/documents/{document_id}/learning-export.md` for a source learning pack Markdown export.
- Preserve the existing plain `GET /api/recall/documents/{document_id}/export.md` contract.
- Include source text/provenance, source-attached notes, graph memory, Study questions, review/progress summary, recent source sessions, attempts, and recap details in the learning pack.
- Extend workspace ZIP export to include per-source readable learning packs under `sources/` while retaining `manifest.json` and attachments.
- Extend portable manifest digests with `study_answer_attempt` and `study_review_session`.
- Add Source overview `Export source` and `Export learning pack` actions.
- Add a compact Home-owned workspace export surface with manifest counts/warnings and ZIP download.
- Keep Reader generated outputs, import/merge-preview apply behavior, Study FSRS scheduling, Reader-led quiz launch, Home discovery ownership, and cleanup hygiene stable.

## Validation Plan

- Backend focused tests for plain export compatibility, learning pack content, workspace ZIP contents, manifest entity counts, and missing attachment warnings.
- Frontend tests for Source overview export actions and Home workspace export preview/download.
- Playwright Stage 958 evidence for a source with notes, graph memory, Study cards, attempts, and sessions exported as a learning pack.
- Broad Stage 959 audit over Reader, Home, Source overview, Study, Notebook, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.
- Full backend `tests/test_api.py`, frontend typecheck, full `frontend/src/App.test.tsx`, `npm run build`, and `git diff --check`.

## Completion Evidence

- `backend/tests/test_api.py` passes with 79 tests.
- `frontend/src/api.test.ts` and `frontend/src/App.test.tsx` pass with 155 tests.
- Stage 958 Playwright evidence records source learning-pack Markdown, Source overview export links, Home workspace export, workspace ZIP learning packs, attempt/session manifest digests, omitted soft-deleted Study cards, harness cleanup, and cleanup dry-run `matchedCount: 0`.

## Out Of Scope

- Cloud sync, share links, shared challenges, import/merge apply, notifications, Recall 2.0 chat/API/MCP, and generated Reader output changes.
