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
- completed Stage 1 through Stage 8 ExecPlans plus a post-Stage 8 placeholder for the next user-directed milestone
- backend shared-core groundwork:
  - `workspace.db` as the primary database target
  - automatic migration from legacy `reader.db`
  - shared tables for source documents, document variants, reading sessions, app settings, change events, chunks, entity mentions, knowledge nodes/edges, review cards/events, and embeddings
  - a generic source locator in storage so pasted text, files, and future URL imports can share one document model
  - UUIDv7-style IDs for new shared records
  - migration tests that preserve reader listing, view loading, progress restore, and settings
- Stage 1 validation closeout is complete:
  - frontend `npm test -- --run`, `npm run lint`, and `npm run build` pass
  - backend `pytest` and app import checks pass
- Stage 2 Recall shell closeout is complete:
  - `Recall` is the default app shell
  - Reader remains a dedicated integrated section
  - deterministic chunking, keyword retrieval, and Markdown export are live
- Stage 3 and Stage 4 closeout is complete:
  - graph extraction and correction are live
  - hybrid retrieval is live
  - source-grounded study cards and FSRS-backed review logging are live
- Stage 5 closeout is complete:
  - a bounded MV3 browser companion is live
  - localhost browser-context retrieval is live
  - low-noise in-page resurfacing, popup lookup, and extension options are live
- Stage 6 closeout is complete:
  - Markdown round-trip fidelity now preserves headings, ordered lists, nested lists, and quotes through import/export
  - shared document views now carry block metadata plus deterministic variant metadata
  - shared reader sessions now store summary detail and accessibility snapshots alongside sentence progress
  - Reader restores from backend last-session state when browser-local session storage is empty
- Stage 7 closeout is complete:
  - workspace change-log APIs are live
  - portable attachment refs and workspace export manifests are live
  - workspace export zip bundles now include manifest plus stored source attachments
  - deterministic merge-preview rules are live without enabling full sync
- Stage 8 closeout is complete:
  - workspace integrity and repair APIs are live
  - startup self-healing now repairs drifted FTS indexes and refreshes derived Recall state when needed
  - export manifests now carry non-fatal missing-attachment warnings while zip export remains available
  - a deterministic benchmark harness now measures ingest, retrieval, browser-context, export, merge preview, and study scheduling flows
- the Stage 1-8 closeout is published on branch `codex/stage8-closeout-doc-sync`
  - product/state closeout commit: `bf3be7f77e56f4e0a00896dcf0a0df4c999db57a`
  - assistant-docs sync commit: `27b7b42d785374236d11f0c335032e9dfab575bf`
  - remote parity was confirmed immediately after push
- Stage 9 is now approved as the next implementation slice:
  - source-linked highlights and notes in Reader and Recall
  - sentence-range anchors within deterministic `reflowed/default` content
  - optional note text only; tags, notebooks, and cross-block spans remain deferred
- Stage 10 and Stage 11 are also approved in outline:
  - Stage 10: browser note capture and note-aware retrieval
  - Stage 11: portable annotation apply and manual knowledge promotion

## Current Limits

- local TTS is intentionally deferred and must remain a future milestone
- scanned or image-only PDFs are detected and rejected instead of OCR'd
- OpenAI transforms require a configured `OPENAI_API_KEY`
- future providers and future chat/Q&A are intentionally deferred
- webpage import is intentionally limited to public article-style HTML pages; live URL sync, browser-tab capture, login-gated pages, and JS-heavy app pages remain out of scope
- the browser companion is intentionally context-only; it does not import the current tab or capture private page data into storage
- `msedgedriver` is still absent on this machine, so live Edge interaction checks currently rely on the temporary Windows-side Playwright harness under `C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright`
- repo/package renaming toward `Recall` is deferred until after the product shell is stable

## Current Roadmap Status

- The active roadmap is no longer Stage 1 stabilization.
- Stage 1 is complete after the resumed validation rerun came back green.
- Stage 2 is complete after the Recall shell, chunking, keyword retrieval, and Markdown export slice landed.
- Stage 3 and Stage 4 are complete after the combined graph/retrieval/study pass landed.
- Stage 5 is complete after the localhost browser companion, backend browser-context API, extension build/tests, and Edge smoke run landed.
- Stage 6 is complete after portability/accessibility contracts, reader-session metadata, backend/frontend validation, and the Edge structured-Markdown/session-restore smoke run landed.
- Stage 7 is complete after the change-log/export/merge groundwork, backend/frontend validation, and the localhost API smoke run landed.
- Stage 8 is complete after the integrity/repair APIs, benchmark harness, extension timeout hardening, validation matrix, and localhost integrity/repair smoke run landed.
- Stage 9 is now the active roadmap milestone.
- Stage 10 is next.
- Stage 11 is queued after Stage 10.

## Recent Detours

- 2026-03-13: created the Stage 0/1 planning set and shifted the roadmap from UI-only polish to shared-core work
- 2026-03-13: implemented backend shared-core storage, legacy `reader.db` migration, and migration coverage while keeping reader routes stable
- 2026-03-13: implemented and validated bounded public webpage snapshot import for article-style pages with local HTML snapshot storage, deterministic article extraction, frontend `Web page` import UI, and snapshot cleanup through the existing delete path
- 2026-03-13: resumed the interrupted Stage 1 validation rerun, confirmed frontend and backend checks are green, and moved the active ExecPlan to Stage 2
- 2026-03-13: completed Stage 2 Recall shell integration and then, at the user's direction, opened one combined Stage 3/4 implementation pass instead of sequencing them separately
- 2026-03-13: completed the combined Stage 3/4 pass with graph extraction, graph feedback, hybrid retrieval, source-grounded study cards, FSRS-backed review logs, and a live Edge-channel validation run
- 2026-03-13: completed Stage 5 augmented browsing with a localhost browser-context API, MV3 extension popup/options/content surfaces, extension tests/build, and an unpacked Edge validation run
- 2026-03-13: completed Stage 6 portability and accessibility integration with shared variant contracts, shared reader-session metadata, backend/frontend coverage, and an Edge structured-Markdown/session-restore validation run
- 2026-03-13: completed Stage 7 tablet-safe groundwork with workspace change-log APIs, portable export bundles, deterministic merge preview, backend/frontend coverage, and a localhost API smoke run
- 2026-03-13: completed Stage 8 hardening and benchmarks with workspace integrity/repair APIs, startup FTS self-healing, benchmark coverage, extension timeout hardening, and localhost integrity/repair validation
- 2026-03-13: published the Stage 1-8 closeout branch, synced touched assistant docs, and approved the Stage 9-11 roadmap extension centered on notes, browser capture, and portable apply flows

## Resume Checklist

1. Read `docs/ROADMAP.md`.
2. Read this anchor.
3. Open the active Stage 9 ExecPlan in `docs/exec_plans/active/`.
4. Start from branch `codex/stage8-closeout-doc-sync`.
5. Keep backend `workspace.db` compatibility intact, including the Stage 8 integrity/repair and benchmark paths.
6. Preserve the current reader experience as a dedicated Reader section inside the Recall-first shell.
7. Implement Stage 9 without reopening local TTS, OCR, cloud sync, collaboration, chat/Q&A, tags, notebooks, or free-text span anchors.
8. Use `docs/assistant/INDEX.md` only if assistant routing help is needed.
