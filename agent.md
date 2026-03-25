# Agent Runbook

Short runbook for future Codex chats in this repo. Treat `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan as canonical project truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-03-25_stage564_post_stage563_home_structural_recall_parity_audit.md`
- Resume shortcut: `resume after Stage 564 post-Stage-563 Home structural Recall-parity audit`
- Current benchmark note: the Stage 498/499 Graph pair, the completed Stage 500-522 Home checkpoint set, the completed Stage 523-532 Reader checkpoint set, the completed Stage 533 Graph implementation checkpoint, the completed Stage 534 Graph audit, the completed Stage 563 Home implementation checkpoint, the completed Stage 564 Home audit, and the local Stage 506 launcher blocker correction now define the current local continuity baseline above the clean-`main` closeout.
- Workflow reset: treat Stage 564 as the latest completed audit while Stage 563 is the latest implementation checkpoint, treat the Stage 537-562 grouped-overview ladder as legacy Home baseline work rather than the active target, then keep `Home`, `Graph`, and original-only `Reader` in refreshed-baseline hold again unless the user explicitly opens another slice; if they do, `Home` remains the likeliest next bounded target.
- Regression-only surfaces: `Notes` and `Study` stay parked as refreshed baselines, and `Reader` remains original-only and cosmetic-only unless the user explicitly unlocks generated-content work.

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
- Audits are regression gates and evidence snapshots, not automatic reprioritization. After the completed Stage 497 closeout, the local Stage 498/499 Graph pair, the completed local Stage 500-522 Home checkpoint set, the completed local Stage 523-532 Reader checkpoint set, the completed local Stage 533 Graph implementation checkpoint, the completed local Stage 534 Graph audit, the completed local Stage 563 Home implementation checkpoint, the completed local Stage 564 Home audit, and the local Stage 506 launcher blocker correction, keep `Graph`, `Home`, and original-only `Reader` as refreshed baselines, keep the current checkpoint in post-Stage-564 audit hold, and only reopen cross-surface queue hopping if the user later resumes product work or a catastrophic regression forces a detour.
- In the current parity track, `Reader` is original-only and cosmetic-only. Do not touch `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, or mode-routing unless the user explicitly reprioritizes generated-content work.
- Every milestone must produce explicit wide-desktop before/after artifacts for the active section and a plain-language statement of what visibly changed.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- This checkpoint is now a post-closeout clean-`main` baseline with newer local parity work: `Graph`, `Home`, and original-only `Reader` are refreshed, the local Stage 498/499 Graph pair, Stage 500-522 Home checkpoint set, Stage 523-532 Reader checkpoint set, Stage 533, Stage 534, Stage 563, and Stage 564 checkpoints are complete, the local Stage 506 launcher correction is complete, `Notes` and `Study` stay regression-only, and `Reader` stays original-only/cosmetic-only.
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
