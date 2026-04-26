# Stage 894 - Home Library-Native Personal Note Items After Stage 893

## Summary

Stage 892/893 made source-attached Notebook notes semantically correct inside the selected-note workbench. Stage 894 carries that note ownership into `Home`: source-attached personal notes should appear as compact Library-native note items and search matches, while saved sources remain source cards and sentence-anchored notes keep highlighted-passage behavior.

This is a frontend-only product pass. It must not add standalone global notes, a block editor, AI note generation, cloud sync, import changes, or backend schema/API changes.

## Scope

- `Home` / Library desktop canvas note visibility for source-attached notes.
- Workspace/global search and Home `Matches` note result presentation.
- Source overview Notebook summary and source-note Reader handoff semantics.
- Embedded `Notebook`, sentence-anchored notes, Home source cards, Reader, Graph, Study, Add Content, and backend graph APIs as regression surfaces.

## Key Changes

- Add a compact `Personal notes` lane inside the Home Library canvas.
  - Feed it only from source-attached notes discovered through existing note endpoints.
  - Show source title, updated date, and note body preview.
  - Open items directly into the embedded Notebook selected-note workbench.
  - Keep the default Home source board as source-owned cards, not a mixed global note grid.

- Extend source-note search presentation.
  - Home `Matches` should expose source-note matches as Notebook results using body/source context, not synthetic source-level anchor or excerpt text.
  - Workspace search source-note results should say `Source note` / `Personal note`, open Notebook as the primary action, and open Reader unanchored.
  - Sentence-note search results should keep anchored Reader reopening and highlighted-passage semantics.

- Preserve Stage 890-893 Notebook behavior.
  - New note still opens a source-attached draft, saves a source note, selects it, and lands on `Source context`.
  - Edit/save/delete, source switching, search, Capture in Reader, Graph promotion, Study card creation, and focused Reader-led Notebook remain functional.

## Public Interfaces / Types

- No backend, storage, schema, import pipeline, Reader output, Graph data, Study scheduling, or cloud contract changes are planned.
- Reuse existing `RecallNoteRecord`, `RecallNoteSearchHit`, and `anchor.kind`.
- Frontend-only helpers may normalize note records into Home personal-note items.
- `buildWorkspaceSearchAnchorOptions` should return no sentence range for source notes and retain sentence ranges for sentence notes.

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
- existing Home preview/density, Reader generated-output, Graph, Study, Add Content, and focused Notebook regression metrics

## Test Plan

- Focused `frontend/src/App.test.tsx` coverage for:
  - Home `New note` save creates a source note that appears in `Personal notes`.
  - Personal-note item uses body preview and hides synthetic source anchor/excerpt text.
  - Personal-note item opens embedded Notebook with the source-context workbench selected.
  - Home/Workspace search source-note result uses source-note presentation and unanchored Reader handoff.
  - Sentence-note highlight panel and anchored Reader reopening stay stable.

- Playwright evidence:
  - Add Stage 894 implementation and Stage 895 audit scripts.
  - Extend the Notebook/Home shared harness enough to record the Stage 894 metrics plus Stage 890-893 and Home/Reader/Graph/Study regressions.

- Standard validation:
  - Targeted Notebook/Home/App Vitest.
  - `npm run build`.
  - `cd backend && uv run pytest tests/test_api.py -k graph -q`.
  - `node --check` on shared harnesses plus Stage 894/895 scripts.
  - Live Stage 894/895 browser runs against `http://127.0.0.1:8000`.
  - `git diff --check`.

## Assumptions

- "First-class notes" means source-attached personal notes in Home/Library and search, not source-less global notes.
- Existing note endpoints are sufficient for a bounded frontend note cache.
- Synthetic source-anchor text may remain stored for compatibility, but source-note UI should not present it as highlighted sentence content.

## Implementation Notes

- Added a compact source-attached `Personal notes` lane inside the Home Library canvas. It is fed by bounded frontend note prefetches for visible Home sources plus cache updates after note save/edit/delete.
- Personal-note rows use source title, updated date, source type, and note body preview only; synthetic source-anchor/excerpt text is not presented as highlighted sentence copy.
- Home personal-note rows open the embedded Notebook selected-note workbench in source-context mode. Existing focused Reader-led Notebook handoffs still use focused source mode.
- Home `Matches` and workspace/global search now surface source notes as Notebook-first `Source note` / `Personal note` results, while source-note Reader handoff omits sentence anchors and sentence-note results retain anchored reopening.
- The personal-note lane is capped to a compact recent set and sits after the first source group in the normal Home board so the Stage 884/885 top-start density gates stay intact; note-only search/empty states still show the lane in-canvas.

## Evidence

- Live Stage 894 browser run against `http://127.0.0.1:8000` wrote `output/playwright/stage894-home-library-native-personal-note-items-validation.json`.
- Key Stage 894 metrics: `homePersonalNoteLaneVisible: true`, `homeNewNoteSavedAppearsInLibrary: true`, `homePersonalNoteUsesBodyPreview: true`, `homePersonalNoteSyntheticAnchorHidden: true`, `homePersonalNoteOpensEmbeddedNotebook: true`, `homePersonalNoteSearchResultVisible: true`, `workspaceSearchSourceNoteReaderHandoffUnanchored: true`, `notebookSourceAnchorContextPanelVisible: true`, and `notebookSentenceAnchorHighlightPanelStable: true`.
