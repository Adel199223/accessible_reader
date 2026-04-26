# Stage 892 - Notebook Source-Anchor Workbench Semantics And Action Ownership After Stage 891

## Summary

Keep the next high-leverage pass on embedded `Notebook`. Stage 890/891 made `New note` real by creating source-attached notes, but the selected source-note workbench still inherits sentence/highlight language such as `Highlighted passage`. The next step is to make source-attached notes feel first-class and note-owned without adding a block editor, AI generation, or standalone global notes.

Benchmark basis: Recall's April 2026 direction makes saved content and personal notes work together, with the home pen action and Notebook tab as editor entry points. This pass keeps the repo's local-first v1 constraint, but aligns the visible source-note semantics with that note-first direction.

## Scope

- Desktop embedded `Notebook` selected-note workbench in `RecallWorkspace.tsx`.
- Source-attached notes created by Stage 890/891 and existing sentence-anchored notes as a regression surface.
- Home `New note`, Notebook command-row `New note`, source selection, note search, edit/save/delete, Reader handoff, Graph promotion, Study card creation, and focused Reader-led Notebook as regression surfaces.

## Key Changes

- Split selected-note workbench semantics by anchor kind.
  - For `anchor.kind === "source"`, replace `Highlighted passage` with a source-owned context seam such as `Source context`.
  - Do not present the synthetic source-level anchor text as if it were a highlighted passage.
  - Keep source title, source type/context, note updated state, export readiness, and note body visible.
  - Keep sentence-anchored notes unchanged: they should still show the real highlighted passage and sentence metadata.

- Reassign source-note actions to source ownership.
  - For source notes, keep `Open source` and `Open in Reader`, but ensure Reader handoff opens the source without sentence-start/end anchors.
  - Keep source-note promotion actions available, but make labels/helper copy avoid implying a highlighted sentence span.
  - Keep delete, save, source handoff, Graph promotion, and Study card creation behavior unchanged.

- Preserve the Stage 890 draft flow.
  - Saving a new source-attached draft should immediately land on the source-note semantic workbench.
  - Cancel, source defaulting, source switching, search, selected-note browsing, and `Capture in Reader` stay intact.
  - Do not add standalone global notes, a block editor, AI notebook generation, cloud sync, chat, import changes, or new promotion semantics.

## Public Interfaces / Types

- No backend, route, schema, storage, API, Reader output, Graph data, Study scheduling, Home, or generated-content contract changes are expected.
- Reuse the Stage 890 `kind: "sentence" | "source"` anchor contract.
- Add UI/audit-only evidence, for example:
  - `notebookSourceAnchorContextPanelVisible`
  - `notebookSourceAnchorHighlightedPassageVisible`
  - `notebookSourceAnchorSyntheticHighlightVisible`
  - `notebookSourceAnchorReaderHandoffUnanchored`
  - `notebookSentenceAnchorHighlightPanelStable`
  - `notebookNewNoteSavedUsesSourceContext`

## Test Plan

- Targeted Vitest in `frontend/src/App.test.tsx`:
  - Source-attached notes render source context, not the old `Highlighted passage` panel.
  - Sentence-anchored notes still render the real `Highlighted passage` panel.
  - Saving from `New note` selects the created source note and immediately shows the source-context workbench.
  - Source-note `Open in Reader` omits sentence anchors; sentence-note Reader handoff keeps anchors.
  - Edit/save/delete, source handoff, Graph promotion, Study card creation, search, source switching, no-active/search-empty states, and focused Reader-led Notebook remain green.

- Live audit:
  - Source-attached selected-note capture proving the fake highlight panel is gone.
  - Sentence-anchored selected-note capture proving highlighted passage behavior remains.
  - New-note saved capture proving the created note lands on source context.
  - Regression captures for Home Stage 885, Add Content, Graph, original-only Reader, Reader active Listen, Study Review, Study Questions, and focused Reader-led Notebook.

- Standard validation:
  - Targeted Notebook/App Vitest.
  - `npm run build`.
  - `cd backend && uv run pytest tests/test_api.py -k graph -q`.
  - `node --check` on the shared Notebook harness plus Stage 892/893 scripts.
  - Live Stage 892/893 browser runs.
  - `git diff --check`.

## Implementation Notes

- Implemented the selected-note anchor-kind branch in `RecallWorkspace.tsx`: source notes now render `Source context`, sentence notes keep `Highlighted passage`, and source-note Reader handoff clears sentence anchors.
- Added focused Notebook/App coverage plus Stage 892/893 Playwright evidence scripts and shared harness metrics.
- Live Stage 892 evidence passed against `http://127.0.0.1:8000` with `notebookSourceAnchorContextPanelVisible: true`, `notebookSourceAnchorHighlightedPassageVisible: false`, `notebookSourceAnchorSyntheticHighlightVisible: false`, `notebookSourceAnchorReaderHandoffUnanchored: true`, `notebookSentenceAnchorHighlightPanelStable: true`, `notebookNewNoteSavedUsesSourceContext: true`, `notebookNewNoteCreatesSourceAttachedNote: true`, `notebookCaptureInReaderStillAvailable: true`, and `notebookStage889EmptyStatesStable: true`.

## Assumptions

- "Vehicle app" was a typo for the Recall app.
- Highest leverage remains embedded `Notebook` for one more pass because Stage 891 made source notes possible, but the selected-note workbench still speaks in sentence-highlight terms.
- The correct fix is semantic ownership and action-label cleanup, not a broader rich-text/block-editor implementation.
- Existing local note data is sufficient; this pass reshapes UI semantics and audit evidence only.
