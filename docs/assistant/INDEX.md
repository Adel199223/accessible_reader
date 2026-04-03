# Assistant Index

Use this folder as a lightweight routing layer. Do not treat it as the canonical source of product truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-04-03_stage790_reader_document_open_topbar_compaction_after_stage789.md`
- Resume shortcut: `resume at post-Stage 791 Reader baseline`
- Current benchmark note: the completed Stage 706/707 closeout baseline now carries the intentional Add Content reopen, the intentional Reader reading-first reopen, the intentional Reader context-rail compaction reopen, the intentional Reader article-field rebalancing reopen, the intentional Reader outer-shell flattening reopen, the intentional Reader source-strip flattening reopen, the intentional Reader source-identity deduplication reopen, the intentional Reader control-band compaction reopen, the intentional Reader Source support-rail deflation reopen, the intentional Reader compact deck centering reopen, the intentional Reader attached support-band fusion reopen, the intentional Reader generated-mode empty-state normalization reopen, the intentional Reader end-to-end resume audit and continuity sync checkpoint, the intentional Reader pre-article lead-in compaction checkpoint, the intentional Reader stacked option-row cleanup checkpoint, the intentional Reader generated-mode affordance cleanup checkpoint, the intentional Reader idle-transport compaction checkpoint, the intentional Reader source-strip metadata deflation checkpoint, the intentional Reader source-strip action compaction checkpoint, the intentional Reader settings-trigger demotion checkpoint, the intentional Reader overflow-payload deflation checkpoint, the intentional Reader theme-first settings simplification checkpoint, the intentional Reader overflow source-action retirement checkpoint, the intentional Reader notebook-trigger relocation checkpoint, the intentional Reader inline-theme choices checkpoint, the intentional Reader overflow-footprint compaction checkpoint, the intentional Reader short-document article-field compaction checkpoint, the intentional Reader derived-context stack-collapse checkpoint, the intentional Reader derived lead-in deduplication checkpoint, the intentional Reader derived metadata deflation checkpoint, the intentional Reader summary-detail inline compaction checkpoint, the intentional Reader derived quick-action retirement checkpoint, the intentional Reader expanded source destination compaction checkpoint, the intentional Reader source support toggle deduplication checkpoint, the intentional Reader support metadata row retirement checkpoint, the intentional Reader Source-support inner-header deflation checkpoint, the intentional Reader Notebook workbench lead-in deflation checkpoint, the intentional Reader active-note tile compaction checkpoint, the intentional Reader note-switcher density deflation checkpoint, the intentional Reader loaded-Reflowed lead-in retirement checkpoint, the intentional Reader source-preview retirement checkpoint, and the intentional Reader document-open topbar compaction checkpoint on top of the March 25, 2026 Recall Home screenshot, the March 26, 2026 Recall Graph screenshot set, the March 28, 2026 Recall `/items` notebook-placement screenshot, the March 15, 2026 Add Content screenshot, and the March 18 plus March 28, 2026 Reader screenshots.
- Workflow reset: treat Stage 791 as the latest completed audit and Stage 790 as the latest implementation checkpoint, with no automatic next slice after this intentional Reader continuity checkpoint unless the user explicitly reprioritizes a surface again.
- Queued order: none; the Stage 692-707 roadmap is complete.
- Latest intentional reopen above that closeout: Stage 790/791 `Reader` document-open topbar compaction.

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
- In the queued Reader track, UI/UX work may later reopen across `Original`, `Reflowed`, `Simplified`, and `Summary`, but do not change generated output text, transform logic, cache semantics, generated placeholders, generated-view payload semantics, or mode-routing unless the user explicitly reprioritizes generated-content work.
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
