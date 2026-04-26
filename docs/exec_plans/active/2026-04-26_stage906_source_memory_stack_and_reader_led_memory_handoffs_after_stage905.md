# Stage 906 - Source Memory Stack And Reader-Led Memory Handoffs After Stage 905

## Status

Complete.

## Intent

Stage 906 turns each focused source overview into a compact source-owned memory stack. Source-attached personal notes remain Notebook-first, while existing graph nodes and study cards for the same source become scannable memory objects with direct handoffs into Graph and Study. Reader-led source-strip memory counts become actionable without reopening global notes, backend schema/API work, AI generation, import/cloud work, block editing, or generated Reader output changes.

## Scope

- Evolve Source overview `Source memory` into a memory stack that includes source-attached personal notes first, source-local graph nodes, and source-local study cards.
- Keep personal notes body-owned, synthetic source anchors hidden, Notebook-first, and unanchored for source-note Reader handoff.
- Add graph memory rows that show node label plus description/evidence preview and open focused Graph with that node selected.
- Add study memory rows that show prompt, status/due state, and evidence preview and open focused Study with that card selected.
- Make Reader source-strip note, graph, and study counts actionable where supported: notes open focused Notebook, graph opens focused Graph, and study opens focused Study.
- Preserve Stage 904/905 cleanup hygiene for all Stage 906/907 browser-created notes.

## Evidence Metrics

- `sourceOverviewMemoryStackVisible`
- `sourceOverviewMemoryStackIncludesPersonalNotes`
- `sourceOverviewMemoryStackIncludesGraphItems`
- `sourceOverviewMemoryStackIncludesStudyItems`
- `sourceOverviewGraphMemoryItemOpensFocusedGraph`
- `sourceOverviewStudyMemoryItemOpensFocusedStudy`
- `sourceOverviewSourceNoteReaderHandoffUnanchored`
- `readerSourceMemoryCountsActionable`
- `readerSourceGraphCountOpensFocusedGraph`
- `readerSourceStudyCountOpensFocusedStudy`
- retained `sourceOverviewPersonalNotesSyntheticAnchorHidden`
- retained `stageHarnessCreatedNotesCleanedUp`
- retained `notesSidebarVisible: false`

## Evidence Captured

- Source overview memory stack rendered with `sourceOverviewMemoryStackVisible: true`, personal notes, graph items, and study items present.
- Source overview graph and study memory rows opened focused Graph and focused Study.
- Source-note Reader handoff remained unanchored with `sourceOverviewSourceNoteReaderHandoffUnanchored: true`.
- Reader source-strip memory counts were actionable, and graph/study counts opened focused Graph/Study.
- Current-run harness notes self-cleaned with `stageHarnessCreatedNotesCleanedUp: true`.
- Cleanup dry-run after Stage 906 matched `0` historical audit artifacts.
- Evidence JSON: `output/playwright/stage906-source-memory-stack-and-reader-led-memory-handoffs-validation.json`.

## Validation Plan

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Source overview|Reader|Notebook|Graph|Study|Personal notes\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k \"graph or notes\" -q"`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage906_source_memory_stack_and_reader_led_memory_handoffs_after_stage905.mjs`
- live Stage 906 browser evidence against `http://127.0.0.1:8000`
- cleanup utility dry-run remains `matchedCount: 0`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
