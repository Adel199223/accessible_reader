# Agent Runbook

Short runbook for future Codex chats in this repo. Treat `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan as canonical project truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-03-24_stage532_post_stage531_reader_dock_tray_demotion_and_glance_note_retirement_audit.md`
- Resume shortcut: `resume after Stage 532 Reader dock tray demotion and glance-note retirement audit`
- Current benchmark note: the Stage 498/499 Graph pair plus the local Stage 500/501, Stage 502/503, the completed Stage 505 Home audit, the local Stage 506 launcher blocker correction, the completed Stage 508 Home audit, the local Stage 509 Home implementation checkpoint, the completed Stage 510 Home audit, the local Stage 511 Home implementation checkpoint, the completed Stage 512 Home audit, the local Stage 513 Home implementation checkpoint, the completed Stage 514 Home audit, the completed Stage 515 Home implementation checkpoint, the completed Stage 516 Home audit, the completed Stage 517 Home implementation checkpoint, the completed Stage 518 Home audit, the completed Stage 519 Home implementation checkpoint, the completed Stage 520 Home audit, the completed Stage 521 Home implementation checkpoint, the completed Stage 522 Home audit, the completed Stage 523 Reader implementation checkpoint, the completed Stage 524 Reader audit, the completed Stage 525 Reader implementation checkpoint, the completed Stage 526 Reader audit, the completed Stage 527 Reader implementation checkpoint, the completed Stage 528 Reader audit, the completed Stage 529 Reader implementation checkpoint, the completed Stage 530 Reader audit, the completed Stage 531 Reader implementation checkpoint, and the completed Stage 532 Reader audit now define the current local continuity baseline above the clean-`main` closeout.
- Workflow reset: treat Stage 532 as the latest completed audit while Stage 531 remains the latest Reader implementation checkpoint, and keep `Home`, `Graph`, plus original-only `Reader` in refreshed-baseline hold unless the user explicitly opens another slice.
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
- Audits are regression gates and evidence snapshots, not automatic reprioritization. After the completed Stage 497 closeout, the local Stage 498/499 Graph pair, the local Stage 500/501 and Stage 502/503 Home follow-ups, the completed local Stage 505 Home audit, the local Stage 506 launcher blocker correction, the completed local Stage 508 Home audit, the local Stage 509 Home implementation checkpoint, the completed local Stage 510 Home audit, the local Stage 511 Home implementation checkpoint, the completed local Stage 512 Home audit, the local Stage 513 Home implementation checkpoint, the completed local Stage 514 Home audit, the completed local Stage 515 Home implementation checkpoint, the completed local Stage 516 Home audit, the completed local Stage 517 Home implementation checkpoint, the completed local Stage 518 Home audit, the completed local Stage 519 Home implementation checkpoint, the completed local Stage 520 Home audit, the completed local Stage 521 Home implementation checkpoint, the completed local Stage 522 Home audit, the completed local Stage 523 Reader implementation checkpoint, the completed local Stage 524 Reader audit, the completed local Stage 525 Reader implementation checkpoint, the completed local Stage 526 Reader audit, the completed local Stage 527 Reader implementation checkpoint, the completed local Stage 528 Reader audit, the completed local Stage 529 Reader implementation checkpoint, the completed local Stage 530 Reader audit, the completed local Stage 531 Reader implementation checkpoint, and the completed local Stage 532 Reader audit, keep `Graph`, `Home`, and original-only `Reader` as refreshed baselines, keep the current checkpoint in post-Stage-532 audit hold, and only reopen cross-surface queue hopping if the user later resumes product work or a catastrophic regression forces a detour.
- In the current parity track, `Reader` is original-only and cosmetic-only. Do not touch `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, or mode-routing unless the user explicitly reprioritizes generated-content work.
- Every milestone must produce explicit wide-desktop before/after artifacts for the active section and a plain-language statement of what visibly changed.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- This checkpoint is now a post-closeout clean-`main` baseline with newer local parity work: `Graph`, `Home`, and original-only `Reader` are refreshed, the local Stage 498/499 Graph pair plus local Stage 500/501, Stage 502/503, Stage 505, Stage 508, Stage 509, Stage 510, Stage 511, Stage 512, Stage 513, Stage 514, Stage 515, Stage 516, Stage 517, Stage 518, Stage 519, Stage 520, Stage 521, Stage 522, Stage 523, Stage 524, Stage 525, Stage 526, Stage 527, Stage 528, Stage 529, Stage 530, Stage 531, and Stage 532 checkpoints are complete, the local Stage 506 launcher correction is complete, `Notes` and `Study` stay regression-only, and `Reader` stays original-only/cosmetic-only.
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
