# Stage 897 - Post-Stage-896 Source Note Promotion Semantics And Evidence Ownership Audit

## Summary

Audit Stage 896 against the live desktop Recall workspace. The audit must prove source-attached personal notes promote into Graph and Study as note-owned memory objects with body/source evidence, while sentence-note promotion, Home personal-note visibility, Notebook source context, Reader handoffs, and cross-surface regressions remain stable.

## Evidence Targets

- `notebookSourceNoteGraphDefaultUsesBody`
- `notebookSourceNoteStudyDefaultUsesBody`
- `sourceNotePromotionSyntheticAnchorHidden`
- `graphSourceNoteEvidenceUsesBodyPreview`
- `studySourceNoteEvidenceUsesBodyPreview`
- `studySourceNoteReaderHandoffUnanchored`
- `sentenceNotePromotionDefaultsStable`
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
- Home `Personal notes` remains compact, source-attached, and Notebook-first.
- Home `New note` still opens a source-attached draft, save selects the new note, and cancel works.
- Source-note Notebook workbench still shows `Source context`; sentence-note workbench still shows `Highlighted passage`.
- Source-note Reader handoff stays unanchored; sentence-note Reader handoff stays anchored.
- Edit/save/delete, source switching, search, Capture in Reader, Graph promotion, Study card creation, and focused Reader-led Notebook remain functional.
- Add Content, Reader generated outputs, Graph canvas/settings, Study scheduling/review, and backend graph APIs remain regression surfaces.

## Validation

- Targeted Notebook/Graph/Study/App Vitest.
- Backend graph pytest.
- `npm run build`.
- `node --check` for shared harnesses and Stage 896/897 scripts.
- Live browser audit against `http://127.0.0.1:8000`.
- `git diff --check`.

## Audit Notes

- If live data lacks an appropriate source-attached note, the harness may create one through the public Home/Notebook flow and promote that same note through the public UI.
- The audit should verify that any synthetic source-level `anchor_text` / `excerpt_text` remains hidden from promoted Graph/Study evidence surfaces.

## Audit Results

- Live Stage 897 audit passed against `http://127.0.0.1:8000` with `output/playwright/stage897-post-stage896-source-note-promotion-semantics-audit-validation.json`.
- Source-note promotion evidence recorded `notebookSourceNoteGraphDefaultUsesBody: true`, `notebookSourceNoteStudyDefaultUsesBody: true`, `sourceNotePromotionSyntheticAnchorHidden: true`, `graphSourceNoteEvidenceUsesBodyPreview: true`, `studySourceNoteEvidenceUsesBodyPreview: true`, `studySourceNoteReaderHandoffUnanchored: true`, and `sentenceNotePromotionDefaultsStable: true`.
- Retained Home/Notebook evidence recorded `homePersonalNoteLaneVisible: true`, `homeNewNoteSavedAppearsInLibrary: true`, `homePersonalNoteUsesBodyPreview: true`, `homePersonalNoteSyntheticAnchorHidden: true`, `homePersonalNoteOpensEmbeddedNotebook: true`, `homePersonalNoteSearchResultVisible: true`, `workspaceSearchSourceNoteReaderHandoffUnanchored: true`, `notebookSourceAnchorContextPanelVisible: true`, `notebookSentenceAnchorHighlightPanelStable: true`, and `notesSidebarVisible: false`.
- Broad regression captures refreshed Home, Graph, original Reader, Study, Add Content-adjacent route surfaces, focused Notebook, source-note Notebook new-note save, sentence-note Notebook, and no-active/search-empty Notebook evidence under `output/playwright/stage897-*`.
