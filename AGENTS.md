# AGENTS

Read these docs in order before doing major work:

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the current active ExecPlan named in `docs/ROADMAP_ANCHOR.md`

If the active section milestone pre-stages the next benchmark audit plan in `docs/exec_plans/active/`, do not assume the highest stage number is the current plan. Follow the plan path named in `docs/ROADMAP_ANCHOR.md`, `agent.md`, and `docs/assistant/INDEX.md`.

Read `docs/assistant/templates/*` only on demand:
- use it when the user explicitly asks for harness/bootstrap prompt creation, project harness sync/audit work, cross-project Codex documentation scaffolding, or a follow-up delta/refinement prompt

Harness quick links:
- `agent.md` is the short repo runbook for future Codex chats
- `docs/assistant/INDEX.md` is the lightweight assistant routing map
- `docs/assistant/workflows/SESSION_RESUME.md` is the stable resume entry for roadmap continuity
- `docs/assistant/workflows/PROJECT_HARNESS_SYNC_WORKFLOW.md` handles explicit harness sync and audit requests

## Non-Negotiables

- `roadmap`, `master plan`, and `next milestone` mean the active project roadmap unless the user redirects
- stay roadmap-driven; if work detours for a blocker or correction, log it and return to the roadmap
- major or multi-file work must start by creating or updating an ExecPlan in `docs/exec_plans/active/`
- once a desktop-first section milestone is active, finish that section end-to-end before switching surfaces; use audits as regression gates and evidence snapshots, not as permission to hop to a new section after every pass
- inside the active section milestone, batch related fixes into a few internal checkpoints instead of reopening one-delta-per-stage micro work
- the March 28 Stage 692/707 roadmap reset and closeout superseded the older surface-by-surface hold guidance: the queued shell/Home/Notebook/Reader/Study ladder is complete, and future work should reopen a surface intentionally instead of auto-starting another queued slice
- `Graph`, `Home`, embedded `Notebook`, `Reader`, and `Study` are now stable regression baselines unless the user explicitly reprioritizes a surface
- the latest intentional `Add Content` checkpoint is now Stage 880/881, which kept the Stage 708/709 import-mode and route-stability baseline intact while replacing the stacked import hero/mode deck/primary card/support rail feel with one compact capture-owned workbench: live browser validation now records `addContentCommandRowCompact: true`, `addContentDialogHeight: 928.25`, `addContentLegacyHeroVisible: false`, `addContentModeOrderStable: true`, `addContentModeTabsCompact: true`, `addContentModeTabMaxHeight: 70.265625`, `addContentPrimaryWorkbenchVisible: true`, `addContentSupportRailVisible: false`, `addContentSupportSeamInline: true`, `homeRouteUnchangedOnOpen: true`, `homeTileLaunchRouteUnchanged: true`, `readerRouteUnchangedOnOpen: true`, and `notebookActionEmbeddedInDialog: false`
- the latest intentional `Home` checkpoint is now Stage 898/899, which kept the Stage 894/895 Home personal-note lane/search baseline and Stage 884/885 preview-density baseline intact while making source-attached Notebook notes selectable as a compact `Personal notes` Home/Library collection board with note-body previews, Notebook-first handoff, unanchored source-note Reader reopening, and source-card boards preserved as source-card boards
- the latest intentional embedded `Notebook` checkpoint is now Stage 892/893, which made source-attached notes use source-owned `Source context`, hid synthetic source-level text from highlighted-passage chrome, kept source-note Reader handoff unanchored, and preserved sentence-anchored highlighted-passage behavior plus Stage 890/891 source-attached draft creation
- the latest intentional source-note promotion checkpoint is now Stage 896/897, which carries source-attached personal notes into Graph and Study as note-owned evidence with body/source context, `Source note` / `Personal note` display language, Notebook-first handoff, unanchored source-note Reader handoff, stable sentence-note promotion defaults, and retained Home/Notebook regression metrics
- the latest source-memory checkpoint is now Stage 900/901, which makes each selected source workspace expose attached personal notes as source-owned memory context with note-body previews, Notebook-first handoff, source-owned New note creation, Reader-led Notebook continuity, and unanchored source-note Reader reopening while Home, Graph, Study, Add Content, backend graph APIs, and generated Reader outputs remain regression surfaces
- the latest evidence-harness hygiene checkpoint is now Stage 902/903, which prevents Playwright-created source-note artifacts from persisting in Home Personal notes, Personal notes board, search, Source memory, Graph evidence, and Study evidence after validation; the historical cleanup utility must run dry-run by default and require an explicit apply flag before deleting matched Stage-marker source notes
- the latest cleanup checkpoint is now Stage 904/905, which deleted only historical source-attached Stage-marker audit notes through the guarded cleanup utility and existing note delete endpoint, then audited that Home Personal notes, Source memory, and workspace search returned to a real-note baseline; do not delete user notes, sentence notes, graph nodes, study cards, documents/imports, or generated Reader outputs
- the latest source-memory checkpoint is Stage 906/907, which makes Source overview show source-attached personal notes, graph nodes, and study cards as one compact source-owned memory stack, and makes Reader source-strip memory counts open focused Notebook, Graph, and Study while preserving Stage 904/905 cleanup hygiene
- the latest Home source-memory-discovery checkpoint is Stage 908/909, which makes source-owned note/graph/study memory visible on Home source cards and list rows, opens the existing Source overview memory stack from those signals, preserves source-card boards, keeps Personal notes note-owned, retains Stage 906/907 source-memory metrics, and keeps cleanup dry-run at `matchedCount: 0`
- the latest Home memory-filter checkpoint is Stage 910/911, which lets Home source boards and Matches filter to sources with any, note, graph, or study memory without turning Home into a mixed memory-object collection or changing Personal notes behavior
- the latest source-memory search checkpoint is Stage 912/913, which adds source-scoped memory search across personal notes, sentence notes, graph items, study cards, and loaded source text while preserving Notebook/Graph/Study/Reader handoffs
- the latest source-scoped review checkpoint is Stage 914/915, which adds a source review panel, source-scoped Study Review/Questions handoffs, question search, and Reader-led Study continuity using existing local Study cards
- the latest review-discovery checkpoint is Stage 916/917, which adds Home review-ready signals and a Study Review dashboard with schedule buckets and source breakdowns while keeping source boards and Personal notes separate
- the latest Study schedule drilldown checkpoint is Stage 918/919, which makes Study dashboard buckets open filtered Questions, composes schedule drilldowns with source scope and question search, keeps status tabs clearable, and leaves no new product slice open
- the latest intentional `Graph` checkpoint is now Stage 848/849, which kept the Stage 846/847 canvas-first default-open onboarding baseline intact while deflating the docked settings rail top start, retiring the verbose `Graph Settings` helper copy, making the preset summary inline, and shrinking `Save as preset` out of hero/full-width chrome, so live browser validation now records `tourVisibleOnOpen: false`, `graphHelpControlsVisibleAtRest: true`, `graphTourEntryLabel: Take Graph tour`, `graphCanvasObscuredByTourOnOpen: false`, `graphTourEntryLabelAfterDismiss: Replay Graph tour`, `graphSettingsHeaderHelperVisible: false`, `graphSettingsHeaderToFirstSectionGap: 16`, `graphSettingsPresetPrimaryActionFullWidth: false`, `graphSettingsPresetSummaryInline: true`, and `graphSettingsRailTopStartCompact: true`
- the Study workbench UI baseline remains Stage 882/883, which kept the Stage 859 command-row baseline, Stage 861 evidence-first support rail, Stage 862/863 single active-card surface, and Stage 855 Questions canvas intact while fusing organizer-wide `Review` into one task-owned workbench where the compact command row and active card share one left-column surface and the support rail stays attached instead of competing; the latest Study workflow checkpoint is Stage 918/919 schedule drilldowns and question triage, and live validation retains `studyReviewTaskWorkbenchFused: true`, `studyQuestionsViewPrimaryCanvasVisible: true`, `homeVisible: true`, `graphCanvasVisible: true`, `notebookVisible: true`, and `notesSidebarVisible: false`
- later `Reader` generated-content work is a separate locked phase; UI/UX work across Reader modes is allowed in the queued roadmap, but do not change generated outputs automatically unless the user explicitly reprioritizes that work
- the latest intentional Reader checkpoint is now Stage 878/879, which kept the compact topbar, shared compact header row, idle speech-specific `Read aloud` pill, nearby Notebook handoff, compact overflow, expanded-source destination compaction, leaner Source support, quiet inline `Source` seam text, selective source-type retirement, heading-first duplicate-title heuristic, frozen generated outputs, the Stage 864/865 at-rest short-document compaction, the Stage 866/867 support-open continuity, and the Stage 876/877 short-document completion strip intact while replacing active/paused playback chrome with one article-owned Listen seam, recording `readerActiveListenSeamVisible: true`, `readerActiveTransportToolbarBloomVisible: false`, `readerActiveListenStatusLabel: Listening`, `readerPausedListenStatusLabel: Paused`, `readerActiveSentenceProgressInline: true`, `readerActiveCurrentSentenceExcerptVisible: true`, `readerActivePrimaryPlaybackLabel: Pause`, `readerPausedPrimaryPlaybackLabel: Resume`, `readerShortDocumentCompletionStripHiddenWhileListening: true`, `readerIdleCompletionStripReturnsAfterStop: true`, `readerSupportOpenActiveListenSeamVisible: true`, `readerSupportOpenShortDocumentContentFitStable: true`, and `readerGeneratedOutputsFrozen: true` on the current live dataset
- keep parsing, storage, search, settings, progress, and deterministic reflow local-first
- treat the browser app as the primary product surface and the Edge extension as a supported companion surface
- browser-native speech is the shipped read-aloud path for v1
- local TTS is deferred and should be treated as `coming soon` unless the user explicitly reprioritizes it
- AI is opt-in only and currently limited to `Simplify` and `Summary`
- keep the extension context-only unless the user explicitly reprioritizes import/capture work
- optimize for Microsoft Edge on Windows 11 while using WSL for the repo/toolchain
- keep the canonical repo in WSL; when the Windows launcher path is involved, preflight WSL first and use the explicit elevated `WslService` repair commands if that service has been disabled
- when the Windows Edge screenshot harness is involved, prefer the temporary Windows Playwright harness when it is intact and fall back to the Codex runtime Playwright install when that temp harness is only partially populated
- optimize for the best overall UX and Recall-quality workflow, not for preserving the current UI structure when a staged redesign would materially improve the experience
- treat the original Recall app as a directional UX benchmark for flow and hierarchy, not as a pixel-perfect copy target
- run targeted validation before broad changes
- keep push explicit; do not push unless the user asks
