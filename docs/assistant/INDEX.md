# Assistant Index

Use this folder as a lightweight routing layer. Do not treat it as the canonical source of product truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-04-28_stage945_post_stage944_study_matching_ordering_question_types_audit.md`
- Resume shortcut: `resume after Stage 945 Study matching and ordering question types audit`
- Current benchmark note: the completed Stage 706/707 closeout baseline now carries completed Stage 944/945 Study matching/ordering question types, completed Stage 942/943 Study fill-in-the-blank answer attempts, completed Stage 940/941 Study choice question types, completed Stage 938/939 Study manual question creation, completed Stage 936/937 Study question edit/delete management, completed Stage 934/935 Study question scheduling controls, completed Stage 932/933 Study memory progress timeline, completed Stage 930/931 Study collection subsets and custom review lens, completed Stage 928/929 Study review-history filters and filtered Review queue, completed Stage 926/927 Study habit calendar and activity range, completed Stage 924/925 Study knowledge stages and memory stats, completed Stage 922/923 Study review progress dashboard, completed Stage 920/921 Home review schedule lens, completed Stage 918/919 Study schedule drilldowns, completed Stage 916/917 review-ready sources and Study schedule dashboard, completed Stage 906/907 source memory stack and Reader-led memory handoffs, completed Stage 904/905 historical audit-note cleanup, completed Stage 902/903 evidence harness hygiene, completed Stage 900/901 source-memory panel and Reader/Notebook continuity pass, completed Stage 898/899 Home personal-notes collection-board pass, Stage 896/897 source-note promotion semantics pass, Stage 894/895 Home Library-native personal note items pass, Stage 892/893 Notebook source-anchor workbench semantics, Stage 890/891 embedded Notebook source-attached new-note flow, Stage 888/889 embedded Notebook empty-state lead ownership and browse-rail list convergence pass, Stage 886/887 embedded Notebook selected-note top-band/action-seam fusion pass, Stage 884/885 Home local-preview fidelity pass, Stage 882/883 Study Review task-workbench fusion, Stage 880/881 Add Content capture-gateway follow-through, the Reader ladder through Stage 878/879, the intentional Stage 818-845 plus Stage 868/871 Home ladder, the intentional Stage 846-849 Graph ladder, and the Stage 872-875 embedded Notebook workbench plus empty-state completion on top of the March 25, 2026 Recall Home screenshot, the March 26, 2026 Recall Graph screenshot set, the March 28, 2026 Recall `/items` notebook-placement screenshot, the March 15, 2026 Add Content screenshot, and the March 18 plus March 28, 2026 Reader screenshots.
- Workflow reset: Stage 944/945 Study matching/ordering question types is complete after completed Stage 942/943 Study fill-in-the-blank answer attempts, completed Stage 940/941 Study choice question types, completed Stage 938/939 Study manual question creation, completed Stage 936/937 Study question edit/delete management, completed Stage 934/935 Study question scheduling controls, completed Stage 932/933 Study memory progress timeline, completed Stage 930/931 Study collection subsets and custom review lens, completed Stage 928/929 Study review-history filters and filtered Review queue, completed Stage 926/927 Study habit calendar and activity range, completed Stage 924/925 Study knowledge stages and memory stats, completed Stage 922/923 Study review progress dashboard, completed Stage 920/921 Home review schedule lens, completed Stage 918/919 Study schedule drilldowns and question triage, completed Stage 916/917 review-ready sources and Study schedule dashboard, completed Stage 914/915 source review queue and Study question find, completed Stage 912/913 source memory search, completed Stage 910/911 Home memory filters, completed Stage 908/909 Home source memory signals, completed Stage 906/907 source memory stack and Reader-led memory handoffs, completed Stage 904/905 historical audit-note cleanup, and completed Stage 903 evidence harness hygiene. No new product slice is open; choose the next Recall-aligned slice intentionally from the roadmap and current product evidence.
- Queued order: none; the Stage 692-707 roadmap is complete.
- Latest intentional reopen above that closeout: completed Stage 944/945 Study matching/ordering question types after completed Stage 942/943 Study fill-in-the-blank answer attempts, completed Stage 940/941 Study choice question types, completed Stage 938/939 Study manual question creation, completed Stage 936/937 Study question edit/delete management, completed Stage 934/935 Study question scheduling controls, completed Stage 932/933 Study memory progress timeline, completed Stage 930/931 Study collection subsets and custom review lens, completed Stage 928/929 Study review-history filters and filtered Review queue, completed Stage 926/927 Study habit calendar and activity range, completed Stage 924/925 Study knowledge stages and memory stats, completed Stage 922/923 Study review progress dashboard, completed Stage 920/921 Home review schedule lens, completed Stage 918/919 Study schedule drilldowns and question triage, completed Stage 916/917 review-ready sources and Study schedule dashboard, completed Stage 914/915 source review queue and Study question find, completed Stage 912/913 source memory search, completed Stage 910/911 Home memory filters, completed Stage 908/909 Home source memory signals, completed Stage 906/907 source memory stack and Reader-led memory handoffs, completed Stage 904/905 historical audit-note cleanup, completed Stage 902/903 evidence harness hygiene, completed Stage 900/901 source-memory panel and Reader/Notebook continuity, completed Stage 898/899 Home personal-notes collection board, Stage 896/897 source-note promotion semantics, and Stage 894/895 `Home` Library-native personal note items.

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
