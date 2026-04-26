# Stage 895 - Post-Stage-894 Home Library-Native Personal Note Items Audit

## Summary

Audit Stage 894 against the live desktop Recall workspace. The audit must prove source-attached personal notes are visible and actionable inside Home/Library and search while saved source cards, source-note Notebook semantics, sentence-note highlighting, and cross-surface regressions remain stable.

## Evidence Targets

- `homePersonalNoteLaneVisible`
- `homeNewNoteSavedAppearsInLibrary`
- `homePersonalNoteUsesBodyPreview`
- `homePersonalNoteSyntheticAnchorHidden`
- `homePersonalNoteOpensEmbeddedNotebook`
- `homePersonalNoteSearchResultVisible`
- `workspaceSearchSourceNoteReaderHandoffUnanchored`
- `notebookSourceAnchorContextPanelVisible`
- `notebookSentenceAnchorHighlightPanelStable`
- `notesSidebarVisible`

## Regression Gates

- Home source cards remain source-owned and preserve Stage 884/885 preview density.
- Home `New note` still opens a source-attached draft, save selects the new note, and cancel works.
- Source-note Reader handoff stays unanchored; sentence-note Reader handoff stays anchored.
- Source overview Notebook summary, source switching, search, edit/save/delete, Capture in Reader, Graph promotion, Study card creation, and focused Reader-led Notebook remain functional.
- Add Content, Reader generated outputs, Graph, Study, and backend graph APIs remain regression surfaces.

## Validation

- Targeted Notebook/Home/App Vitest.
- Backend graph pytest.
- `npm run build`.
- `node --check` for shared harnesses and Stage 894/895 scripts.
- Live browser audit against `http://127.0.0.1:8000`.
- `git diff --check`.

## Audit Notes

- This audit should not require backend/schema changes if Stage 894 only uses existing source-scoped note endpoints.
- If live data lacks a source-attached note for the default Home surface, the harness may create one through the public UI flow and verify that same note in the lane.

## Audit Evidence

- Live Stage 895 browser audit against `http://127.0.0.1:8000` wrote `output/playwright/stage895-post-stage894-home-library-native-personal-note-items-audit-validation.json`.
- Personal-note metrics stayed green: `homePersonalNoteLaneVisible: true`, `homeNewNoteSavedAppearsInLibrary: true`, `homePersonalNoteUsesBodyPreview: true`, `homePersonalNoteSyntheticAnchorHidden: true`, `homePersonalNoteOpensEmbeddedNotebook: true`, `homePersonalNoteSearchResultVisible: true`, and `workspaceSearchSourceNoteReaderHandoffUnanchored: true`.
- Notebook/source-note regression metrics stayed green: `notebookSourceAnchorContextPanelVisible: true`, `notebookSourceAnchorHighlightedPassageVisible: false`, `notebookSourceAnchorSyntheticHighlightVisible: false`, `notebookNewNoteSavedUsesSourceContext: true`, `notebookSourceAnchorReaderHandoffUnanchored: true`, and `notebookSentenceAnchorHighlightPanelStable: true`.
- Broad regression metrics stayed green: `notesSidebarVisible: false`, `homeOpenOverviewTopStartCompact: true`, `homeOpenOverviewFirstDayHeaderTopOffset: 5.46875`, `homeOpenOverviewGridColumnCount: 5`, `homeOpenOverviewFirstRowTileCount: 4`, `homeLocalCaptureMeaningfulPreviewCount: 20`, `homeVisibleClippingCount: 0`, `graphVisible: true`, `studyVisible: true`, and `simplifiedViewAvailable: false`.
