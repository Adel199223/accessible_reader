# Agent Runbook

Short runbook for future Codex chats in this repo. Treat `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan as canonical project truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-03-28_stage708_add_content_modal_recall_style_entry_reset_after_stage707.md`
- Resume shortcut: `resume at post-Stage 709 Add Content baseline`
- Current benchmark note: the completed Stage 706/707 closeout baseline now sits beneath the March 28, 2026 Stage 708/709 Add Content reset, while the benchmark set still uses the March 25, 2026 Recall Home screenshot, the March 26, 2026 Recall Graph screenshot set, the March 28, 2026 Recall `/items` notebook-placement screenshot, the March 15, 2026 Add Content screenshot, and the March 18, 2026 Study plus Reader screenshots.
- Workflow reset: treat Stage 709 as the latest completed audit and Stage 708 as the latest implementation checkpoint; there is still no automatic next slice after this intentional Add Content reopen unless the user explicitly reprioritizes a surface again.
- Queued order: none; the Stage 692-707 roadmap is complete.
- Regression-only surfaces until explicitly reopened again: `Graph`, `Home`, embedded `Notebook`, `Reader`, and `Study`; Reader generated outputs remain frozen.

## Read Order
1. `AGENTS.md`
2. `BUILD_BRIEF.md`
3. `docs/ROADMAP.md`
4. `docs/ROADMAP_ANCHOR.md`
5. `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell or surface UI
6. the latest checkpoint ExecPlan(s) named in `docs/ROADMAP_ANCHOR.md`
7. `docs/assistant/INDEX.md` for harness routing

## Operating Rules
- Work from WSL for repo commands and toolchains, preferably through `wsl.exe bash -lc ...` when starting from Windows-side shells.
- Use Windows Edge as the browser validation target.
- Treat the browser app as the primary surface and the Edge browser companion as a supported secondary surface.
- When asked to open the app on this machine, use `powershell -ExecutionPolicy Bypass -File .\scripts\open_recall_app.ps1` from the repo root instead of ad hoc `Start-Process msedge`, `cmd /c start`, or direct browser shell commands. The launcher reuses or starts the repo-local backend, ensures the built Recall shell exists, and opens Edge through the repo-owned Playwright path.
- Keep parsing, storage, search, settings, progress, and reflow local-first.
- Public webpage import is snapshot-based: fetch once, store locally, and reopen from the local snapshot.
- Ship browser-native speech first; local TTS stays `coming soon` until reprioritized.
- AI is opt-in only and limited to `Simplify` and `Summary`.
- Keep the extension context-only unless the user explicitly reopens broader capture/import work.
- Major or multi-file work starts by creating or updating an ExecPlan in `docs/exec_plans/active/`.
- Run targeted validation before broader checks.
- Treat screenshot-based benchmark comparison as required when changing Recall shell or top-level surface UI.
- Wide desktop is the primary benchmark truth for every remaining milestone; focused/narrow adaptation comes second inside the same section milestone.
- Audits are regression gates and evidence snapshots, not permission to drift away from the queued roadmap. After the Stage 692/695 roadmap reset ladder, follow the queued order instead of reopening ad hoc micro-passes unless a catastrophic regression or benchmark contradiction forces a detour.
- In the queued Reader track, UI/UX work may extend across `Original`, `Reflowed`, `Simplified`, and `Summary`, but do not change generated output text, transform logic, cache semantics, generated placeholders, or mode-routing unless the user explicitly reprioritizes generated-content work.
- Every milestone must produce explicit wide-desktop before/after artifacts for the active section and a plain-language statement of what visibly changed.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- The stable post-closeout baseline still holds underneath this reopen: Stage 694/695 completed the shared shell reset, Stage 696/697 completed the Home ergonomics follow-through, Stage 698/699 completed the embedded `Notebook` follow-through, Stage 700/701 completed the first broad Reader IA reset, Stage 702/703 completed the generated-mode Reader UX-only refinement and invariant lock while outputs stayed frozen, Stage 704/705 completed the Study review-dashboard reset, and Stage 706/707 completed the final queued cleanup sweep before the roadmap returned to explicit user-directed reopens only.
- Stage 708/709 then intentionally reopened only the global `Add Content` flow: the shell launcher now reads `Add`, the dialog now behaves as a deliberate Recall-style entry surface with clearer mode hierarchy, Home and Reader both open the same route-stable modal, and `Notebook` remains separate from the import path.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use `docs/ROADMAP_ANCHOR.md`, this runbook, and `docs/assistant/INDEX.md` to identify the current one instead of assuming the highest stage number is current.
- Treat `frontend/src/App.test.tsx` as a valid broad shell/route check again. Prefer targeted component tests first, then run the whole file when shell or route continuity changes. If the file ever stalls again, inspect App-level callback identity and `ReaderWorkspace` effect dependencies before assuming Vitest itself is the problem; the last real stall came from callback churn in `App.tsx` creating a render/effect loop.
- Do not push unless the user explicitly asks.

## Routing
- Use `docs/assistant/INDEX.md` for a quick map of the harness docs.
- Use `docs/assistant/workflows/ROADMAP_WORKFLOW.md` for roadmap-driven product work.
- Use `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` for Edge read-aloud, sentence highlighting, or progress validation.
- Use `docs/assistant/workflows/SESSION_RESUME.md` when the user asks to resume the roadmap or asks where work should restart.
- Use `docs/assistant/workflows/PROJECT_HARNESS_SYNC_WORKFLOW.md` when the user says `implement the template files`, `sync project harness`, `audit project harness`, or `check project harness`.
- Read `docs/assistant/templates/*` only when the user explicitly asks for harness/bootstrap prompt creation, explicit harness sync/audit work, cross-project scaffolding, or a follow-up delta/refinement prompt.
