# Assistant Index

Use this folder as a lightweight routing layer. Do not treat it as the canonical source of product truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-03-25_stage564_post_stage563_home_structural_recall_parity_audit.md`
- Resume shortcut: `resume after Stage 564 post-Stage-563 Home structural Recall-parity audit`
- Current benchmark note: the Stage 498/499 Graph pair, the completed Stage 500-522 Home checkpoint set, the completed Stage 523-532 Reader checkpoint set, the completed Stage 533 Graph implementation checkpoint, the completed Stage 534 Graph audit, the completed Stage 563 Home implementation checkpoint, the completed Stage 564 Home audit, and the Stage 506 launcher blocker correction now define the current local continuity baseline above the clean-`main` closeout.
- Workflow reset: treat Stage 564 as the latest completed audit while Stage 563 is the latest implementation checkpoint, treat the Stage 537-562 grouped-overview ladder as legacy Home baseline work rather than the active target, then keep `Home`, `Graph`, and original-only `Reader` in refreshed-baseline hold again unless the user explicitly opens another slice; if they do, `Home` remains the likeliest next bounded target.
- Regression-only rule: `Notes` and `Study` stay parked as refreshed baselines, and `Reader` stays original-only and cosmetic-only unless the user explicitly unlocks generated-content work.

## Start Here
1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell or surface UI
5. the latest checkpoint ExecPlan(s) named in `docs/ROADMAP_ANCHOR.md`
6. this index

## Operating Defaults
- Run repo commands from WSL, preferably through `wsl.exe bash -lc ...` when working from Windows-side shells.
- Validate browser behavior in Windows Edge.
- Keep the app local-first.
- Treat the browser app as primary and the Edge extension as a supported companion surface.
- Treat browser-native speech as the shipped read-aloud path.
- Treat local TTS as `coming soon`.
- Keep AI opt-in and limited to `Simplify` and `Summary`.
- Use targeted validation before broad sweeps.
- Treat the benchmark matrix plus fresh screenshots as required when changing Recall shell or top-level surface UI.
- Treat wide-desktop before/after captures for the active section as required milestone artifacts, not optional polish.
- Audits verify regressions; they do not reopen the old queue or silently start another redesign slice unless the user explicitly changes priorities or a catastrophic regression forces a detour.
- In the current parity track, `Reader` is original-only and cosmetic-only. Do not touch `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, generated-view controls, or mode-routing unless the user explicitly reprioritizes that work.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- Prefer targeted component tests first, then use the broad `frontend/src/App.test.tsx` pass when shell or route continuity changes, and keep the repo-owned Edge screenshot harness as the visual truth source for Recall surface work.
- If the broad `App.test.tsx` file ever appears to stall again, check for App-level callback identity churn and `ReaderWorkspace` effect loops before downgrading the whole-file suite; that was the root cause of the last real stall.
- Keep push explicit.

## Use When
- Read `docs/assistant/APP_KNOWLEDGE.md` when you need a short project snapshot before opening source files.
- Read `docs/assistant/workflows/ROADMAP_WORKFLOW.md` when the user says `roadmap`, `master plan`, or `next milestone`.
- Read `docs/assistant/workflows/SESSION_RESUME.md` when the user asks where to resume or wants the next roadmap restart point.
- Read `docs/assistant/workflows/PROJECT_HARNESS_SYNC_WORKFLOW.md` for `implement the template files`, `sync project harness`, `audit project harness`, or `check project harness`.
- Read `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell, Library/home, Add Content, Graph, Study, or other benchmark-sensitive UI work.
- Read `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` when the task touches Edge speech, highlighting, progress restore, or manual browser validation.
- Read `docs/assistant/templates/CODEX_DELTA_REFINEMENT_PROMPT.md` only when the user explicitly asks for a follow-up delta/refinement prompt that folds later prototype learnings back into the shipped app.
- Read `agent.md` for the short repo runbook.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use this index plus `docs/ROADMAP_ANCHOR.md` to identify the current one instead of following the highest stage number blindly.

## Do Not Use
- Do not use this folder to override `BUILD_BRIEF.md`, roadmap docs, or source code.
- Do not open `docs/assistant/templates/*` unless the user explicitly asks for harness/bootstrap prompt work, explicit harness sync/audit work, or a delta/refinement prompt.
