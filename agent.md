# Agent Runbook

Short runbook for future Codex chats in this repo. Treat `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan as canonical project truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-03-22_stage497_repo_closeout_and_cleanup_after_stage496.md`
- Resume shortcut: `resume for Stage 497 repo closeout`
- Current benchmark note: the March 22, 2026 Stage 496 Home audit remains the latest product checkpoint, while Stage 497 is the active branch-closeout plan for publishing the full Stage 369-496 backlog cleanly.
- Workflow reset: before any new product slice opens, finish the Stage 497 repo closeout by creating the two required commits, rerunning the Stage 495/496 validation ladder, promoting the branch to `main`, pruning the feature branch, and verifying clean local and remote state.
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
- Keep parsing, storage, search, settings, progress, and reflow local-first.
- Public webpage import is snapshot-based: fetch once, store locally, and reopen from the local snapshot.
- Ship browser-native speech first; local TTS stays `coming soon` until reprioritized.
- AI is opt-in only and limited to `Simplify` and `Summary`.
- Major or multi-file work starts by creating or updating an ExecPlan in `docs/exec_plans/active/`.
- Run targeted validation before broader checks.
- Treat screenshot-based benchmark comparison as required when changing Recall shell or top-level surface UI.
- Wide desktop is the primary benchmark truth for every remaining milestone; focused/narrow adaptation comes second inside the same section milestone.
- Audits are regression gates and evidence snapshots, not automatic reprioritization. After Stage 496, keep `Graph`, `Home`, and original-only `Reader` as refreshed baselines, use Stage 497 to close out and publish the backlog cleanly, and only reopen cross-surface queue hopping if the user later resumes product work or a catastrophic regression forces a detour.
- In the current parity track, `Reader` is original-only and cosmetic-only. Do not touch `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, or mode-routing unless the user explicitly reprioritizes generated-content work.
- Every milestone must produce explicit wide-desktop before/after artifacts for the active section and a plain-language statement of what visibly changed.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- This checkpoint is now a post-Home custom collection management audit state: `Graph`, `Home`, and original-only `Reader` are refreshed, `Graph` is the likeliest next broad parity target, `Notes` and `Study` stay regression-only, `Reader` stays original-only/cosmetic-only, and any new slice still starts with a new ExecPlan pair.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use `docs/ROADMAP_ANCHOR.md`, this runbook, and `docs/assistant/INDEX.md` to identify the current one instead of assuming the highest stage number is current.
- Treat `frontend/src/App.test.tsx` as a valid broad shell/route check again. Prefer targeted component tests first, then run the whole file when shell or route continuity changes. If the file ever stalls again, inspect App-level callback identity and `ReaderWorkspace` effect dependencies before assuming Vitest itself is the problem; the last real stall came from callback churn in `App.tsx` creating a render/effect loop.
- Do not push unless the user explicitly asks.

## Routing
- Use `docs/assistant/INDEX.md` for a quick map of the harness docs.
- Use `docs/assistant/workflows/ROADMAP_WORKFLOW.md` for roadmap-driven product work.
- Use `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` for Edge read-aloud, sentence highlighting, or progress validation.
- Read `docs/assistant/templates/*` only when the user explicitly asks for harness/bootstrap prompt creation, cross-project scaffolding, or a follow-up delta/refinement prompt.
