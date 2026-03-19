# Agent Runbook

Short runbook for future Codex chats in this repo. Treat `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan as canonical project truth.

## Current Checkpoint
- Active plan: `docs/exec_plans/active/2026-03-19_stage368_all_surface_baseline_freeze_after_stage367.md`
- Resume shortcut: `resume from Stage 368`
- Current benchmark note: the March 19, 2026 Stage 366/367 desktop-first `Study` milestone succeeded overall, so `Graph`, `Home`, `Reader`, `Notes`, and `Study` are now the locked regression baselines.
- Workflow reset: keep the broader desktop-first cadence, but do not reopen queue hopping now that the full top-level redesign track is complete.
- Parked surfaces: all five top-level Recall surfaces are regression-only until the user explicitly unlocks the next phase.

## Read Order
1. `AGENTS.md`
2. `BUILD_BRIEF.md`
3. `docs/ROADMAP.md`
4. `docs/ROADMAP_ANCHOR.md`
5. `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell or surface UI
6. the current active ExecPlan named in `docs/ROADMAP_ANCHOR.md`
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
- Audits are regression gates and evidence snapshots, not automatic reprioritization. While Stage 368 is active, keep all top-level surfaces parked unless the user explicitly changes priorities or a catastrophic regression forces a detour.
- Every milestone must produce explicit wide-desktop before/after artifacts for the active section and a plain-language statement of what visibly changed.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- This checkpoint is now a post-redesign hold state: preserve the locked baselines for `Home`, `Graph`, `Reader`, `Notes`, and `Study` until the user chooses the next phase.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use `docs/ROADMAP_ANCHOR.md`, this runbook, and `docs/assistant/INDEX.md` to identify the current one instead of assuming the highest stage number is current.
- Treat `frontend/src/App.test.tsx` as a valid broad shell/route check again. Prefer targeted component tests first, then run the whole file when shell or route continuity changes. If the file ever stalls again, inspect App-level callback identity and `ReaderWorkspace` effect dependencies before assuming Vitest itself is the problem; the last real stall came from callback churn in `App.tsx` creating a render/effect loop.
- Do not push unless the user explicitly asks.

## Routing
- Use `docs/assistant/INDEX.md` for a quick map of the harness docs.
- Use `docs/assistant/workflows/ROADMAP_WORKFLOW.md` for roadmap-driven product work.
- Use `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` for Edge read-aloud, sentence highlighting, or progress validation.
- Read `docs/assistant/templates/*` only when the user explicitly asks for harness/bootstrap prompt creation, cross-project scaffolding, or a follow-up delta/refinement prompt.
