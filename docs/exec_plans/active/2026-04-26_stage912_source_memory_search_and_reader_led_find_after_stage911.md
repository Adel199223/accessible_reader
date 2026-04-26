# Stage 912 - Source Memory Search And Reader-Led Find After Stage 911

## Status

Complete.

## Intent

Stage 912 turns the Stage 906 source memory stack into a findable source-local workspace. Users can search within the selected source's personal notes, sentence notes, graph items, study cards, and loaded source text, then hand off directly to Notebook, Graph, Study, or Reader without creating a global mixed memory collection.

## Scope

- Add a frontend-only `Search source memory` control inside Source overview's existing `Source memory` panel.
- Store the source-memory query in Recall workspace continuity and clear it when the active source changes.
- Filter source memory in place while a query is active:
  - source-attached personal notes match note body and source context
  - sentence notes match note body, anchor text, and excerpt text
  - graph items match label, description, aliases, and status/evidence text already loaded in the graph snapshot
  - study items match prompt, answer, status, and source-span evidence
  - source text matches loaded local document-view text from existing document-view endpoints
- Preserve existing handoffs: source notes open Notebook first and Reader unanchored; sentence notes/source text keep sentence anchors when available; graph opens focused Graph; study opens focused Study.
- Add a Reader source-strip `Find memory` handoff that opens Source overview with the source-memory search focused.
- Keep Home source boards, Home memory filters, Personal notes board/lane/search, Graph/Study promotion, Add Content, generated Reader outputs, cleanup hygiene, backend routes, and storage contracts unchanged.

## Evidence Metrics

- `sourceMemorySearchControlsVisible`
- `sourceMemorySearchFindsPersonalNotes`
- `sourceMemorySearchFindsGraphItems`
- `sourceMemorySearchFindsStudyItems`
- `sourceMemorySearchFindsSourceText`
- `sourceMemorySearchPersonalNoteOpensNotebook`
- `sourceMemorySearchGraphItemOpensFocusedGraph`
- `sourceMemorySearchStudyItemOpensFocusedStudy`
- `sourceMemorySearchReaderHandoffPreservesAnchorSemantics`
- `readerSourceMemorySearchOpensSourceOverview`
- `sourceMemorySearchEmptyStateClearable`
- retained `homeMemoryFilterControlsVisible`
- retained `homeSourceMemorySignalsVisible`
- retained `sourceOverviewMemoryStackVisible`
- retained `readerSourceMemoryCountsActionable`
- retained `stageHarnessCreatedNotesCleanedUp`
- retained `notesSidebarVisible: false`
- cleanup dry-run remains `matchedCount: 0`

## Validation Plan

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Source overview|Reader|Notebook|Graph|Study|Home|memory|search\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k \"graph or notes\" -q"`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage912_source_memory_search_and_reader_led_find_after_stage911.mjs`
- live Stage 912 browser evidence against `http://127.0.0.1:8000`
- cleanup utility dry-run remains `matchedCount: 0`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Evidence

- Implemented frontend-only source-memory query continuity, in-panel Source overview filtering, source text matching from existing document views, Reader `Find memory` handoff, and focused handoffs from search results to Notebook, Graph, Study, and Reader.
- Focused App coverage passed: `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t "Source overview|Reader|Notebook|Graph|Study|Home|memory|search"'` (59 passed, 49 skipped).
- Frontend build passed: `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`.
- Backend graph/notes pytest passed: `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "graph or notes" -q'` (6 passed, 58 deselected).
- Syntax checks passed for `scripts/playwright/notebook_workbench_shared.mjs`, `scripts/playwright/cleanup_recall_note_audit_artifacts.mjs`, `scripts/playwright/stage912_source_memory_search_and_reader_led_find_after_stage911.mjs`, and `scripts/playwright/stage913_post_stage912_source_memory_search_and_reader_led_find_audit.mjs`.
- Cleanup dry-run passed against `http://127.0.0.1:8000` with `matchedCount: 0`.
- Live Stage 912 browser evidence passed: `node scripts/playwright/stage912_source_memory_search_and_reader_led_find_after_stage911.mjs --base-url=http://127.0.0.1:8000`.
- Evidence artifact: `output/playwright/stage912-source-memory-search-and-reader-led-find-validation.json`.
- Recorded `sourceMemorySearchControlsVisible: true`, `sourceMemorySearchFindsPersonalNotes: true`, `sourceMemorySearchFindsGraphItems: true`, `sourceMemorySearchFindsStudyItems: true`, `sourceMemorySearchFindsSourceText: true`, `sourceMemorySearchPersonalNoteOpensNotebook: true`, `sourceMemorySearchGraphItemOpensFocusedGraph: true`, `sourceMemorySearchStudyItemOpensFocusedStudy: true`, `sourceMemorySearchReaderHandoffPreservesAnchorSemantics: true`, `readerSourceMemorySearchOpensSourceOverview: true`, `sourceMemorySearchEmptyStateClearable: true`, `stageHarnessCreatedNotesCleanedUp: true`, `stageHarnessCreatedNoteCleanupFailures: []`, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed.
