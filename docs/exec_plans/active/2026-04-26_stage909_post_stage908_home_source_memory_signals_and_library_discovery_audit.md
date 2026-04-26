# Stage 909 - Post-Stage-908 Home Source Memory Signals And Library Discovery Audit

## Status

Complete.

## Intent

Stage 909 audits that Stage 908 Home source memory signals remain stable across the broader Recall workspace. It confirms Home/Library can show source-owned memory presence without mixing memory objects into source boards, while Source overview, Reader-led memory handoffs, Personal notes, Graph, Study, Add Content, generated Reader outputs, and cleanup hygiene remain stable.

## Scope

- Re-run Home source-card and list-row memory signal evidence.
- Confirm memory-signal handoff opens the existing Source overview memory stack.
- Confirm search/Matches source results surface memory presence while Personal notes remain note-owned.
- Preserve Stage 906/907 source memory stack and Reader-led note/graph/study handoff behavior.
- Retain Stage 904/905 cleanup hygiene: current-run harness notes self-clean and historical audit-artifact dry-run remains empty.
- Keep backend graph/notes APIs as regression surfaces only.

## Evidence Metrics

- `homeSourceMemorySignalsVisible`
- `homeSourceMemorySignalsUseSourceOwnedCounts`
- `homeSourceMemorySignalOpensSourceOverviewStack`
- `homeSourceMemorySignalsDoNotMixBoardItems`
- `homeSourceMemorySignalsPreservePreviewDensity`
- `homeSourceListRowsShowMemorySignal`
- `homeMatchesSourceMemorySignalVisible`
- `homePersonalNotesBoardStillNoteOwned`
- retained Stage 906/907 source-memory metrics
- retained Stage 904/905 cleanup metrics
- retained broad Home/Reader/Notebook/Graph/Study/Add Content regression metrics
- retained `notesSidebarVisible: false`

## Validation Plan

- `node scripts/playwright/stage909_post_stage908_home_source_memory_signals_and_library_discovery_audit.mjs`
- targeted App Vitest, frontend build, backend graph/notes pytest
- `node --check` for shared Notebook/Home harnesses and Stage 908/909 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence Captured

- `output/playwright/stage909-post-stage908-home-source-memory-signals-and-library-discovery-audit-validation.json`
- Live audit retained `homeSourceMemorySignalsVisible: true`, `homeSourceMemorySignalsUseSourceOwnedCounts: true`, `homeSourceMemorySignalOpensSourceOverviewStack: true`, `homeSourceMemorySignalsDoNotMixBoardItems: true`, `homeSourceMemorySignalsPreservePreviewDensity: true`, `homeSourceListRowsShowMemorySignal: true`, `homeMatchesSourceMemorySignalVisible: true`, `homePersonalNotesBoardStillNoteOwned: true`, `sourceOverviewMemoryStackVisible: true`, `sourceOverviewMemoryStackIncludesGraphItems: true`, `sourceOverviewMemoryStackIncludesStudyItems: true`, `readerSourceMemoryCountsActionable: true`, `stageHarnessCreatedNotesCleanedUp: true`, `stageHarnessCreatedNoteCleanupFailures: []`, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
