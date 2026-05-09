# Assistant Index

Use this folder as a lightweight routing layer. Do not treat it as the canonical source of product truth.

## Current Checkpoint
- Active checkpoint doc: none; latest completed audit doc is `docs/exec_plans/active/2026-05-09_stage1033_post_stage1032_graph_path_study_questions_audit.md`
- Resume shortcut: `resume after Stage 1033 Graph path Study Questions audit`
- Current benchmark note: the completed Stage 706/707 closeout baseline now carries completed Stage 1032/1033 Graph path Study Questions/gap-build handoffs, completed Stage 1030/1031 Graph path relation practice handoffs, completed Stage 1028/1029 Graph relation practice return loop, completed Stage 1026/1027 Graph relation practice handoffs, completed Stage 1024/1025 relation practice progress signals, completed Stage 1022/1023 relation practice review session handoff, completed Stage 1020/1021 Home relation practice gap discovery, completed Stage 1018/1019 Source relation practice gap build, completed Stage 1016/1017 Home relation-practice queue lens, completed Stage 1014/1015 related-source practice readiness, completed Stage 1012/1013 Home related-source discovery, completed Stage 1010/1011 source-related Graph resurfacing, completed Stage 1008/1009 source-scoped Graph connection review, completed Stage 1006/1007 Graph connection review queue, completed Stage 1004/1005 Graph gap build queue and return loop, completed Stage 1002/1003 Home Graph-gap Reading queue lens, completed Stage 1000/1001 highlight review Graph connection filters, completed Stage 998/999 highlight review Graph coverage and knowledge handoffs, completed Stage 996/997 highlight review guided sessions, completed Stage 994/995 highlight review bulk triage, completed Stage 992/993 highlight review next actions, completed Stage 990/991 covered-highlight review recap return loop, completed Stage 988/989 multi-card highlight Study coverage selection, completed Stage 986/987 Study review completion highlight-state behavior, completed Stage 984/985 highlight-covered review session handoff, completed Stage 982/983 queue-scoped highlight review, completed Stage 980/981 learning-gap queue filters, completed Stage 978/979 source learning gaps and next actions, completed Stage 976/977 highlight review state and Study coverage, completed Stage 974/975 Library reading queue and highlight-to-Study actions, completed Stage 972/973 Reader highlights/resume/collection inbox, completed Stage 970/971 Collection learning workspaces, completed Stage 968/969 Library collection tree, completed Stage 966/967 Add Content import collections and Pocket ZIP fidelity, completed Stage 964/965 Add Content bulk import queue, completed Stage 962/963 Workspace backup payloads and safe local restore, completed Stage 960/961 Workspace backup preview and restore readiness, completed Stage 958/959 Source learning exports and workspace backup, completed Stage 956/957 Reader-led source quiz launch, and the earlier local Study quiz engine ladder.
- Workflow reset: Stage 1032/1033 Graph path Study Questions handoffs are complete above Stage 1030/1031 Graph path relation practice handoffs, Stage 1028/1029 Graph relation practice return loop, Stage 1026/1027 Graph relation practice handoffs, Stage 1024/1025 relation practice progress signals, Stage 1022/1023 relation practice review session handoff, and Stage 1020/1021 Home relation practice gap discovery; Stage 970/971 Collection learning workspaces and organize-in-place remains the collection workspace baseline beneath it. Open the next product slice deliberately with a fresh ExecPlan.
- Current override: no product slice is active after completed Stage 1033.
- Queued order: none; the Stage 692-707 roadmap is complete.
- Latest intentional reopen above that closeout: completed Stage 1032/1033 Graph path Study Questions/gap-build handoffs above completed Stage 1030/1031 Graph path relation practice handoffs, completed Stage 1028/1029 Graph relation practice return loop, completed Stage 1026/1027 Graph relation practice handoffs, completed Stage 1024/1025 relation practice progress signals, completed Stage 1022/1023 relation practice review session handoff, completed Stage 1020/1021 Home relation practice gap discovery, completed Stage 1018/1019 Source relation practice gap build, completed Stage 1016/1017 Home relation-practice queue lens, completed Stage 1014/1015 related-source practice readiness, completed Stage 1012/1013 Home related-source discovery, completed Stage 1010/1011 source-related Graph resurfacing, completed Stage 1008/1009 source-scoped Graph connection review, completed Stage 1006/1007 Graph connection review queue, completed Stage 1004/1005 Graph gap build queue and return loop, completed Stage 1002/1003 Home Graph-gap Reading queue lens, completed Stage 1000/1001 highlight review Graph connection filters, completed Stage 998/999 highlight review Graph coverage and knowledge handoffs, completed Stage 996/997 highlight review guided sessions, completed Stage 994/995 highlight review bulk triage, completed Stage 992/993 highlight review next actions, completed Stage 990/991 covered-highlight review recap return loop, completed Stage 988/989 multi-card highlight Study coverage selection, completed Stage 986/987 Study review completion highlight-state behavior, completed Stage 984/985 highlight-covered review session handoff, completed Stage 982/983 queue-scoped highlight review, completed Stage 980/981 learning-gap queue filters, completed Stage 978/979 source learning gaps and next actions, completed Stage 976/977 highlight review state and Study coverage, completed Stage 974/975 Library reading queue and highlight-to-Study actions, completed Stage 972/973 Reader highlights/resume/collection inbox, completed Stage 970/971 Collection learning workspaces, completed Stage 968/969 Library collection tree, completed Stage 966/967 Add Content import collections and Pocket ZIP fidelity, completed Stage 964/965 Add Content bulk import queue, completed Stage 962/963 Workspace backup payloads and safe local restore, completed Stage 960/961 Workspace backup preview and restore readiness, completed Stage 958/959 Source learning exports and workspace backup, completed Stage 956/957 Reader-led quiz launch, and the earlier local Study quiz engine ladder.

## Start Here
1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell or surface UI
5. the latest checkpoint ExecPlan(s) named in `docs/ROADMAP_ANCHOR.md`
6. this index

## Operating Defaults
- Run repo commands from WSL, preferably through `wsl.exe bash -lc ...` when working from Windows-side shells.
- Keep the canonical repo in WSL and use repo-owned launcher preflight instead of migrating the repo to native Windows to work around a machine-side WSL outage.
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
- In the queued Reader track, UI/UX work may later reopen across `Original`, `Reflowed`, `Simplified`, and `Summary`, but do not change generated output text, transform logic, cache semantics, generated placeholders, generated-view payload semantics, or mode-routing unless the user explicitly reprioritizes generated-content work.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- Prefer targeted component tests first, then use the broad `frontend/src/App.test.tsx` pass when shell or route continuity changes, and keep the repo-owned Edge screenshot harness as the visual truth source for Recall surface work.
- The repo-owned Edge screenshot harness now falls back to the healthy Codex runtime Playwright install when the temporary Windows harness directory is only partially populated.
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
- If the Windows launcher reports a disabled `WslService`, run the elevated repair commands from `agent.md` before retrying.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use this index plus `docs/ROADMAP_ANCHOR.md` to identify the current one instead of following the highest stage number blindly.

## Do Not Use
- Do not use this folder to override `BUILD_BRIEF.md`, roadmap docs, or source code.
- Do not open `docs/assistant/templates/*` unless the user explicitly asks for harness/bootstrap prompt work, explicit harness sync/audit work, or a delta/refinement prompt.
