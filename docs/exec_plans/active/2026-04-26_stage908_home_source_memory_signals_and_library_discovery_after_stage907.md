# Stage 908 - Home Source Memory Signals And Library Discovery After Stage 907

## Status

Complete.

## Intent

Stage 908 makes source-owned memory visible earlier in Home/Library. After Stage 906/907 made source overview and Reader-led source workspaces expose personal notes, graph nodes, and study cards as one source-local memory stack, Home source cards and list rows should show compact memory signals so users can see which sources have attached memory before opening them.

## Scope

- Add a frontend-only source memory summary grouped by document id from existing source-attached note cache, graph snapshot nodes, and study cards.
- Show compact source-owned memory signals on Home source cards and list rows when a source has attached notes, graph nodes, or study cards.
- Let memory signals hand off to the existing Source overview memory stack for that source.
- Preserve Home source boards as source-card boards; do not mix notes, graph nodes, or study cards into the chronological source grid.
- Preserve Personal notes board/lane/search as note-owned and Notebook-first.
- Keep Source overview memory stack, Reader memory counts, Graph, Study, Add Content, generated Reader outputs, backend graph/notes APIs, and cleanup hygiene as regression surfaces.

## Evidence Metrics

- `homeSourceMemorySignalsVisible`
- `homeSourceMemorySignalsUseSourceOwnedCounts`
- `homeSourceMemorySignalOpensSourceOverviewStack`
- `homeSourceMemorySignalsDoNotMixBoardItems`
- `homeSourceMemorySignalsPreservePreviewDensity`
- `homeSourceListRowsShowMemorySignal`
- `homeMatchesSourceMemorySignalVisible`
- `homePersonalNotesBoardStillNoteOwned`
- retained `sourceOverviewMemoryStackVisible`
- retained `sourceOverviewMemoryStackIncludesGraphItems`
- retained `sourceOverviewMemoryStackIncludesStudyItems`
- retained `readerSourceMemoryCountsActionable`
- retained `stageHarnessCreatedNotesCleanedUp`
- retained `notesSidebarVisible: false`
- cleanup dry-run remains `matchedCount: 0`

## Validation Plan

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Home|Source overview|Reader|Notebook|Graph|Study|Personal notes|memory\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k \"graph or notes\" -q"`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage908_home_source_memory_signals_and_library_discovery_after_stage907.mjs`
- live Stage 908 browser evidence against `http://127.0.0.1:8000`
- cleanup utility dry-run remains `matchedCount: 0`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Evidence Captured

- `output/playwright/stage908-home-source-memory-signals-and-library-discovery-validation.json`
- Live metrics recorded `homeSourceMemorySignalsVisible: true`, `homeSourceMemorySignalsUseSourceOwnedCounts: true`, `homeSourceMemorySignalOpensSourceOverviewStack: true`, `homeSourceMemorySignalsDoNotMixBoardItems: true`, `homeSourceMemorySignalsPreservePreviewDensity: true`, `homeSourceListRowsShowMemorySignal: true`, `homeMatchesSourceMemorySignalVisible: true`, `homePersonalNotesBoardStillNoteOwned: true`, retained Stage 906/907 source-memory metrics, `stageHarnessCreatedNotesCleanedUp: true`, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
