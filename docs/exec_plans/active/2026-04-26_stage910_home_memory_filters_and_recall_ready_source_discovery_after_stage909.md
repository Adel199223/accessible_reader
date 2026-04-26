# Stage 910 - Home Memory Filters And Recall-Ready Source Discovery After Stage 909

## Status

Complete.

## Intent

Stage 910 turns Stage 908 Home source-memory signals into an active discovery workflow. Home source boards and Matches can be filtered to sources with attached personal notes, graph nodes, study cards, or any memory, while Source overview remains the canonical memory-stack destination.

## Scope

- Add a frontend-only Home memory filter state: `all`, `any`, `notes`, `graph`, `study`, defaulting to `all`.
- Store the memory filter in existing Recall workspace continuity state.
- Add compact Memory controls to the existing Home source toolbar/sort popover.
- Apply memory filtering only to Home source-card/list boards and source Matches results.
- Preserve Personal notes board/lane/search as note-owned and Notebook-first.
- Keep Stage 908 memory signals and handoff to Source overview memory stack.
- Keep backend schema/API, import/cloud, generated Reader outputs, AI, block editor, and standalone/global note behavior unchanged.

## Evidence Metrics

- `homeMemoryFilterControlsVisible`
- `homeMemoryFilterAnyNarrowsSourceBoard`
- `homeMemoryFilterNotesOnlyUsesSourceOwnedCounts`
- `homeMemoryFilterGraphOnlyUsesSourceOwnedCounts`
- `homeMemoryFilterStudyOnlyUsesSourceOwnedCounts`
- `homeMemoryFilterMatchesSourceResults`
- `homeMemoryFilterEmptyStateClearable`
- `homeMemoryFilterPreservesPersonalNotesBoard`
- `homeMemoryFilterSignalsOpenSourceOverviewStack`
- retained `homeSourceMemorySignalsVisible`
- retained `homeSourceMemorySignalOpensSourceOverviewStack`
- retained `homeSourceMemorySignalsDoNotMixBoardItems`
- retained `homePersonalNotesBoardStillNoteOwned`
- retained `sourceOverviewMemoryStackVisible`
- retained `readerSourceMemoryCountsActionable`
- retained `stageHarnessCreatedNotesCleanedUp`
- retained `notesSidebarVisible: false`
- cleanup dry-run remains `matchedCount: 0`

## Validation Plan

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Home|Source overview|Reader|Notebook|Graph|Study|Personal notes|memory\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k \"graph or notes\" -q"`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage910_home_memory_filters_and_recall_ready_source_discovery_after_stage909.mjs`
- live Stage 910 browser evidence against `http://127.0.0.1:8000`
- cleanup utility dry-run remains `matchedCount: 0`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Evidence

- Implemented frontend-only Home memory filter state and continuity storage for `all`, `any`, `notes`, `graph`, and `study`.
- Added compact Memory controls to the Home sort popover plus a clearable active filter chip and empty-state clear action.
- Filtered Home source boards and Matches before grouping/counting while preserving Personal notes board/lane/search as note-owned surfaces.
- Added focused App coverage for memory filters, Matches, empty clear, Personal notes preservation, and memory-signal Source overview handoff.
- Added shared Playwright memory-filter evidence plus Stage 910/911 scripts; current-run harness notes are tracked and deleted.
- Live Stage 910 evidence passed against `http://127.0.0.1:8000`; the local dataset has graph/study memory on every source, so the `Any` evidence confirms source-owned coverage when it cannot shrink that all-memory board.
