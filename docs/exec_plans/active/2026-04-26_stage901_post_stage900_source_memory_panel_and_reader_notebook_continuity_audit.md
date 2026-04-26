# Stage 901 - Post-Stage-900 Source Memory Panel And Reader/Notebook Continuity Audit

## Summary

Audit Stage 900 against the live desktop Recall workspace. The audit must prove Source overview and Reader-led source workspace affordances expose source-attached personal notes as source memory, while Home personal-note boards, Notebook semantics, Graph/Study source-note evidence, Reader handoffs, and broad regressions stay stable.

## Evidence Targets

- `sourceOverviewPersonalNotesPanelVisible`
- `sourceOverviewPersonalNotesUsesBodyPreview`
- `sourceOverviewPersonalNotesSyntheticAnchorHidden`
- `sourceOverviewPersonalNotesOpensEmbeddedNotebook`
- `sourceOverviewPersonalNotesReaderHandoffUnanchored`
- `sourceOverviewNewNoteCreatesSourceAttachedNote`
- `readerSourceNotebookContinuityVisible`
- `readerSourceNotebookContinuityOpensEmbeddedNotebook`
- `homePersonalNotesOrganizerSectionVisible`
- `homePersonalNotesBoardVisible`
- `homePersonalNotesBoardUsesBodyPreview`
- `homePersonalNotesBoardSyntheticAnchorHidden`
- `notebookSourceAnchorContextPanelVisible`
- `notebookSentenceAnchorHighlightPanelStable`
- `notebookSourceNoteGraphDefaultUsesBody`
- `notebookSourceNoteStudyDefaultUsesBody`
- `graphSourceNoteEvidenceUsesBodyPreview`
- `studySourceNoteEvidenceUsesBodyPreview`
- `studySourceNoteReaderHandoffUnanchored`
- `notesSidebarVisible`

## Regression Gates

- Source overview source-memory notes remain note-owned and Notebook-first.
- Source-note Reader handoff stays unanchored; sentence-note Reader handoff stays anchored.
- Home `Personal notes` lane/board/search remain functional and source boards remain source-card boards.
- Graph/Study promoted source-note evidence remains body/source owned and Notebook-first.
- Add Content, Reader generated outputs, Graph, Study, and backend graph APIs remain regression surfaces only.

## Validation

- Targeted App Vitest.
- `npm run build`.
- Backend graph pytest.
- `node --check` for shared harnesses and Stage 900/901 scripts.
- Live browser audit against `http://127.0.0.1:8000`.
- `git diff --check`.

## Status

Completed on 2026-04-26.

## Evidence

- Targeted App Vitest passed: `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Source overview|Home|Notebook|Personal notes|Graph|Study\""`.
- Frontend production build passed: `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`.
- Backend graph regression passed: `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`.
- Playwright syntax checks passed for `scripts/playwright/notebook_workbench_shared.mjs`, `scripts/playwright/stage900_source_memory_panel_and_reader_notebook_continuity_after_stage899.mjs`, and `scripts/playwright/stage901_post_stage900_source_memory_panel_and_reader_notebook_continuity_audit.mjs`.
- Live Stage 900 and Stage 901 browser runs passed against `http://127.0.0.1:8000` with `runtimeBrowser: chromium`, `headless: true`.
- Stage 901 recorded `sourceOverviewPersonalNotesPanelVisible: true`, `sourceOverviewPersonalNotesUsesBodyPreview: true`, `sourceOverviewPersonalNotesSyntheticAnchorHidden: true`, `sourceOverviewPersonalNotesOpensEmbeddedNotebook: true`, `sourceOverviewPersonalNotesReaderHandoffUnanchored: true`, `sourceOverviewNewNoteCreatesSourceAttachedNote: true`, `readerSourceNotebookContinuityVisible: true`, `readerSourceNotebookContinuityOpensEmbeddedNotebook: true`, retained Stage 899 Home personal-note board metrics, retained Stage 897 Graph/Study source-note evidence metrics, and `notesSidebarVisible: false`.
