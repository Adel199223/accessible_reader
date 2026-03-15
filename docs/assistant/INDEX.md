# Assistant Index

Use this folder as a lightweight routing layer. Do not treat it as the canonical source of product truth.

## Start Here
1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell or surface UI
5. the latest active ExecPlan in `docs/exec_plans/active/`
6. this index

## Operating Defaults
- Run repo commands from WSL, preferably through `wsl.exe bash -lc ...` when working from Windows-side shells.
- Validate browser behavior in Windows Edge.
- Keep the app local-first.
- Treat browser-native speech as the shipped read-aloud path.
- Treat local TTS as `coming soon`.
- Keep AI opt-in and limited to `Simplify` and `Summary`.
- Use targeted validation before broad sweeps.
- Treat the benchmark matrix plus fresh screenshots as required when changing Recall shell or top-level surface UI.
- Prefer targeted component tests plus the repo-owned Edge screenshot harness when the large `frontend/src/App.test.tsx` file shows its long-standing stall behavior.
- Keep push explicit.

## Use When
- Read `docs/assistant/APP_KNOWLEDGE.md` when you need a short project snapshot before opening source files.
- Read `docs/assistant/workflows/ROADMAP_WORKFLOW.md` when the user says `roadmap`, `master plan`, or `next milestone`.
- Read `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell, Library/home, Add Content, Graph, Study, or other benchmark-sensitive UI work.
- Read `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` when the task touches Edge speech, highlighting, progress restore, or manual browser validation.
- Read `docs/assistant/templates/CODEX_DELTA_REFINEMENT_PROMPT.md` only when the user explicitly asks for a follow-up delta/refinement prompt that folds later prototype learnings back into the shipped app.
- Read `agent.md` for the short repo runbook.

## Do Not Use
- Do not use this folder to override `BUILD_BRIEF.md`, roadmap docs, or source code.
- Do not open `docs/assistant/templates/*` unless the user explicitly asks for harness/bootstrap prompt work or a delta/refinement prompt.
