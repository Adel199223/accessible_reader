# Roadmap Anchor

Persistent continuity anchor for future chats and handoffs.

## Default Meaning Of "Roadmap"

- Unless explicitly redirected, `roadmap`, `master plan`, and `next milestone` mean the active plan for this workspace.
- If a task deviates for a blocker or correction, record it and return to the roadmap afterward.

## Current State

As of 2026-03-13, this workspace includes:

- the existing accessible-reader frontend and backend
- local import and parsing for TXT, Markdown, HTML, DOCX, and text-based PDF
- public article-style webpage import that fetches once, stores a local HTML snapshot, and reopens from that snapshot
- deterministic `Original` and `Reflowed` views
- Edge-first browser speech with sentence highlighting
- opt-in OpenAI `Simplify` and `Summary`
- local library/search, reopen support, and persisted reader settings/progress
- a bounded assistant harness in `agent.md` and `docs/assistant/`
- Stage 0/1 planning logs, research notes, repo-fit notes, and future integration logs
- an active Stage 1 ExecPlan focused on baseline stabilization plus shared-core extraction
- backend shared-core groundwork:
  - `workspace.db` as the primary database target
  - automatic migration from legacy `reader.db`
  - shared tables for source documents, document variants, reading sessions, app settings, change events, chunks, entity mentions, knowledge nodes/edges, review cards/events, and embeddings
  - a generic source locator in storage so pasted text, files, and future URL imports can share one document model
  - UUIDv7-style IDs for new shared records
  - migration tests that preserve reader listing, view loading, progress restore, and settings

## Current Limits

- local TTS is intentionally deferred and must remain a future milestone
- scanned or image-only PDFs are detected and rejected instead of OCR'd
- OpenAI transforms require a configured `OPENAI_API_KEY`
- future providers and future chat/Q&A are intentionally deferred
- webpage import is intentionally limited to public article-style HTML pages; live URL sync, browser-tab capture, login-gated pages, and JS-heavy app pages remain out of scope
- `msedgedriver` is still absent on this machine, so live Edge interaction checks currently rely on the temporary Windows-side Playwright harness under `C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright`
- the accessible-reader UI and webpage-import work are currently being changed in parallel with shared-core work, so the frontend baseline should still be treated as active reconciliation rather than frozen

## Current Roadmap Status

- The active roadmap is no longer UI-only polish.
- Stage 1 is now baseline stabilization plus shared-core extraction for the broader local-first knowledge workspace.
- Stage 1B backend groundwork is implemented and validated.
- Stage 1A frontend reconciliation now includes keeping the active accessible-reader UI cleanup and public webpage snapshot import green while shared-core compatibility settles.

## Recent Detours

- 2026-03-13: created the Stage 0/1 planning set and shifted the roadmap from UI-only polish to shared-core work
- 2026-03-13: implemented backend shared-core storage, legacy `reader.db` migration, and migration coverage while keeping reader routes stable
- 2026-03-13: implemented and validated bounded public webpage snapshot import for article-style pages with local HTML snapshot storage, deterministic article extraction, frontend `Web page` import UI, and snapshot cleanup through the existing delete path

## Resume Checklist

1. Read `docs/ROADMAP.md`.
2. Read this anchor.
3. Open the active Stage 1 ExecPlan in `docs/exec_plans/active/`.
4. Inspect the latest accessible-reader UI and webpage-snapshot-import changes before touching frontend files.
5. Rerun frontend `npm test`, `npm run lint`, and `npm run build` against the settled reader branch.
6. Keep backend `workspace.db` compatibility intact while reconnecting the reader frontend to it.
7. Once frontend reconciliation is complete, proceed to Stage 2 Recall foundation work instead of reopening broad UI polish by default.
8. Use `docs/assistant/INDEX.md` only if assistant routing help is needed.
