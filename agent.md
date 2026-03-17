# Agent Runbook

Short runbook for future Codex chats in this repo. Treat `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan as canonical project truth.

## Current Checkpoint
- Active plan: `docs/exec_plans/active/2026-03-17_stage211_recall_graph_selector_strip_utility_collapse_and_detail_peek_softening.md`
- Resume shortcut: `resume from Stage 211`
- Current benchmark note: Stage 210 is complete; Graph still leads because the selector strip still reads like a standing utility column and the default detail peek still brackets the canvas, so Stage 211 now collapses the remaining utility stack and softens the default peek.
- Deferred issue to keep parked unless it becomes the next blocker: the narrower-width Recall rail/top-grid reflow regression.

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
- In bundled dominant-surface mode, stay on the same leading surface through a small bundle of related fixes before rerunning the full benchmark audit; only switch surfaces sooner if a direct regression or a fresh audit justifies it.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use `docs/ROADMAP_ANCHOR.md`, this runbook, and `docs/assistant/INDEX.md` to identify the current one instead of assuming the highest stage number is current.
- Treat `frontend/src/App.test.tsx` as a valid broad shell/route check again. Prefer targeted component tests first, then run the whole file when shell or route continuity changes. If the file ever stalls again, inspect App-level callback identity and `ReaderWorkspace` effect dependencies before assuming Vitest itself is the problem; the last real stall came from callback churn in `App.tsx` creating a render/effect loop.
- Do not push unless the user explicitly asks.

## Routing
- Use `docs/assistant/INDEX.md` for a quick map of the harness docs.
- Use `docs/assistant/workflows/ROADMAP_WORKFLOW.md` for roadmap-driven product work.
- Use `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` for Edge read-aloud, sentence highlighting, or progress validation.
- Read `docs/assistant/templates/*` only when the user explicitly asks for harness/bootstrap prompt creation, cross-project scaffolding, or a follow-up delta/refinement prompt.
