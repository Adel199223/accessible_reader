# Roadmap Anchor

Persistent continuity anchor for future chats and handoffs.

## Default Meaning Of "Roadmap"

- Unless explicitly redirected, `roadmap`, `master plan`, and `next milestone` mean the active plan for this workspace.
- If a task deviates for a blocker or correction, record it and return to the roadmap afterward.

## Current State

As of 2026-03-14, this workspace includes:

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
- a bounded pre-Stage-9 stabilization detour is complete:
  - fetch-level network failures now show actionable local-service reconnect guidance instead of raw `Failed to fetch`
  - Recall now exposes explicit unavailable states for library, graph, study, and document-detail loading plus retry actions
  - Reader now distinguishes `empty library` from `service unavailable` while keeping import controls usable
  - live Playwright smoke coverage now includes outage and retry recovery checks for both Recall and Reader
- the Stage 1-8 closeout is published on branch `codex/stage8-closeout-doc-sync`
  - product/state closeout commit: `bf3be7f77e56f4e0a00896dcf0a0df4c999db57a`
  - assistant-docs sync commit: `27b7b42d785374236d11f0c335032e9dfab575bf`
  - remote parity was confirmed immediately after push
- Stage 9 closeout is complete:
  - shared note storage, note FTS, note change events, and note CRUD/search routes are live in the backend
  - Reader now supports sentence-range note capture, persisted note highlighting, and route-anchor jump-back inside deterministic `reflowed/default`
  - Recall now includes a dedicated `Notes` section with document-scoped note lists, note search, edit/delete flows, and `Open in Reader`
  - stale saved-session view/note fetches now wait until the active document resolves, preventing noisy startup 404s after document removal
  - backend/frontend/extension validation and a live Playwright note smoke run on a clean temp workspace are green
- Stage 10 closeout is complete:
  - the MV3 companion now supports bounded browser note capture for exact saved public-page matches
  - note hits now surface in Recall retrieval and browser-context summaries
  - a debug-only extension inspection build plus a real Edge unpacked-extension harness close the prior live-validation gap
- the Reader shell convergence correction is complete:
  - Reader now renders inside Recall-native hero, sidebar, tab, and card patterns instead of a standalone sibling app shell
  - product-facing runtime labels now use `Recall Workspace` and `Recall Workspace API`
- the Reader-as-section parity follow-up is complete:
  - the shared workspace section row now owns `Library`, `Graph`, `Study`, `Notes`, and `Reader`
  - returning from Reader preserves the prior Recall section instead of defaulting back to `Library`
  - compact no-document Reader onboarding still exposes `Settings` without reviving the old standalone Reader shell
- Stage 11 is complete:
  - portable `recall_note` entities now participate in workspace export manifests and merge-preview decisions
  - Notes detail now promotes notes into confirmed graph nodes and manual study cards
  - promoted manual graph/study artifacts survive derived graph refreshes and deterministic study-card regeneration
  - a live localhost browser smoke is green after catching and fixing the promoted-card Study landing edge case
- Stage 12 roadmap refresh is complete:
  - a live localhost UX audit confirmed the largest remaining gap is workflow polish in the add/search/read/note loop, not another backend feature tier
  - the next milestone is now a frontend-first shell and Reader workflow polish slice
- Stage 13 workflow polish is complete:
  - Recall now exposes global `New` and `Search` actions with a reusable add-source dialog and a fresh-session workspace search surface
  - global search now hands source and note results back into Recall sections and anchored Reader reopen flows
  - Reader now keeps source and note context adjacent in a focused split-view layout instead of stacking support chrome above the document
  - frontend validation, live Edge import/search smokes, and the repo-owned Edge extension harness are green after the shell change
- A product-direction correction is now fully implemented:
  - Recall remains the product shell
  - Reader keeps its reading behaviors while now presenting as a Recall section instead of a separate app identity
- A UX-priority correction is now the active guidance baseline:
  - preserve local-first behavior, routes, anchors, browser-companion handoff, and reading continuity
  - change layout, shell hierarchy, and interaction patterns whenever that materially improves Recall-quality UX
  - treat the original Recall app as a directional benchmark for workflow and hierarchy rather than a pixel-perfect copy target

## Current Limits

- local TTS is intentionally deferred and must remain a future milestone
- scanned or image-only PDFs are detected and rejected instead of OCR'd
- OpenAI transforms require a configured `OPENAI_API_KEY`
- future providers and future chat/Q&A are intentionally deferred
- webpage import is intentionally limited to public article-style HTML pages; live URL sync, browser-tab capture, login-gated pages, and JS-heavy app pages remain out of scope
- the browser companion is intentionally context-only; it does not import the current tab or capture private page data into storage
- `msedgedriver` is still absent on this machine, so live Edge interaction checks currently rely on the temporary Windows-side Playwright harness under `C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright`
- repo/package renaming beyond current runtime labels is still deferred until a later cleanup slice

## Current Roadmap Status

- The active roadmap is no longer Stage 1 stabilization.
- Stage 1 is complete after the resumed validation rerun came back green.
- Stage 2 is complete after the Recall shell, chunking, keyword retrieval, and Markdown export slice landed.
- Stage 3 and Stage 4 are complete after the combined graph/retrieval/study pass landed.
- Stage 5 is complete after the localhost browser companion, backend browser-context API, extension build/tests, and Edge smoke run landed.
- Stage 6 is complete after portability/accessibility contracts, reader-session metadata, backend/frontend validation, and the Edge structured-Markdown/session-restore smoke run landed.
- Stage 7 is complete after the change-log/export/merge groundwork, backend/frontend validation, and the localhost API smoke run landed.
- Stage 8 is complete after the integrity/repair APIs, benchmark harness, extension timeout hardening, validation matrix, and localhost integrity/repair smoke run landed.
- The bounded pre-Stage-9 stabilization detour is complete after the frontend resilience pass, validation reruns, and live outage/recovery smoke checks landed.
- Stage 9 is complete after the shared note-storage slice, Reader note capture/jump-back, Recall note management, validation reruns, and the live Playwright temp-workspace smoke run landed.
- Stage 10 is complete after the browser note-capture, note-aware retrieval, debug harness, and real Edge unpacked-extension validation pass landed.
- The Reader shell convergence correction is complete after the Recall-first UI realignment and product-label cleanup landed.
- Stage 11 is complete.
- Stage 12 is complete after the UX audit and next-slice decision landed.
- Stage 13 is complete.
- Stage 14 recall density and contextual Reader polish is now the active milestone.

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
- 2026-03-13: completed a pre-Stage-9 stabilization detour that replaced raw `Failed to fetch` copy with actionable local-service guidance, added retryable unavailable states in Recall and Reader, and verified outage/recovery behavior in Playwright before resuming Stage 9
- 2026-03-13: completed Stage 9 source-linked highlights and notes with shared note storage/search, Reader note capture and anchored jump-back, Recall note management, stale-session startup guards, full validation reruns, and a live Playwright temp-workspace smoke pass
- 2026-03-14: approved a bounded Stage 10 closeout extension for a debug-only extension validation harness plus a manual Edge unpacked-extension smoke, followed immediately by Reader shell convergence into the Recall-first workspace
- 2026-03-14: completed the Stage 10 closeout with browser note capture, note-aware retrieval, a debug-only extension inspection build, and a real Edge unpacked-extension harness pass, then completed the Reader shell convergence correction with Recall-first UI alignment and runtime label cleanup
- 2026-03-14: completed a Reader-as-section parity follow-up that removed the remaining top-level `Recall | Reader` split, unified the workspace section row, restored prior-section return behavior after Reader navigation, kept no-document Settings reachable, and reran the full validation matrix plus the real Edge debug harness
- 2026-03-14: completed Stage 11 with portable `recall_note` manifest coverage, note-to-graph and note-to-study promotion flows, preservation of promoted manual knowledge across rebuilds, and a live localhost browser smoke that exposed and fixed the promoted-card Study landing bug
- 2026-03-14: approved a UX-first guidance correction so future roadmap work preserves behaviors and local-first guarantees while explicitly allowing shell, layout, and workflow changes whenever that improves Recall-quality UX
- 2026-03-14: completed the Stage 12 roadmap refresh with a live localhost UX audit, identified workflow polish as the highest-leverage gap, and opened Stage 13 for global add/search flow plus focused Reader split-view work
- 2026-03-14: completed Stage 13 with shell-level add/search actions, a fresh-session workspace search dialog, focused Reader split view, a defensive keyboard-shortcut guard fix, frontend validation reruns, live Edge import/search smokes, and a green rerun of the repo-owned Edge extension harness

## Resume Checklist

1. Read `docs/ROADMAP.md`.
2. Read this anchor.
3. Open the active Stage 14 ExecPlan in `docs/exec_plans/active/`.
4. Start from branch `codex/stage8-closeout-doc-sync`.
5. Keep backend `workspace.db` compatibility intact, including the Stage 8 integrity/repair and benchmark paths.
6. Preserve the current local-first behaviors, routes, anchors, browser-companion handoff, and Reader capabilities while further tightening shell density, contextual usefulness, and narrower-screen flow.
7. Implement Stage 14 without reopening local TTS, OCR, cloud sync, collaboration, chat/Q&A, or other deferred systems by default.
8. Use `docs/assistant/INDEX.md` only if assistant routing help is needed.
