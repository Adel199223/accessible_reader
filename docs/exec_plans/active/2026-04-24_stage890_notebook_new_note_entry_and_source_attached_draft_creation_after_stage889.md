# Stage 890 - Notebook New Note Entry And Source-Attached Draft Creation After Stage 889

## Summary

Keep the active section on embedded `Notebook`. Stage 889 settled the selected, no-active, search-empty, and browse-rail chrome; this pass makes the visible `New note` affordance open a real source-attached draft workflow instead of only navigating into Notebook.

## Scope

- Embedded desktop Notebook and the Home `New note` toolbar action in `RecallWorkspace.tsx`.
- Minimal source-level note anchor support for local-first manual Notebook drafts.
- Preserve Reader-led highlighted note capture, selected-note editing, search, source selection, promotions, and Stage 889 empty-state behavior.
- Keep Home, Reader generated outputs, Graph, Study, Add Content, and focused Reader-led Notebook as regression surfaces.

## Implementation Notes

- Add `kind: "sentence" | "source"` to note anchors, defaulting existing anchors to `sentence`.
- Source anchors stay tied to an existing saved source and use the document's reflowed/default variant for storage compatibility, but they skip sentence-range validation.
- `New note` opens a compact Notebook draft workbench for the current selected source or first note-capable source.
- Saving creates a source-attached note, selects it immediately, and keeps the existing source/search controls nearby.
- `Capture in Reader` remains the highlighted/sentence-anchor path and must not create note data directly.

## Validation

- Targeted Notebook/App Vitest.
- Backend note API tests for source anchors and sentence-anchor compatibility.
- `npm run build`.
- Backend graph pytest.
- `node --check` on shared Notebook harness plus Stage 890/891 scripts.
- Live Stage 890/891 browser audits.
- `git diff --check`.

## Completion Evidence

- Implemented the source-attached draft flow and minimal `kind: "sentence" | "source"` note-anchor contract.
- Live Stage 890 browser evidence passed against `http://127.0.0.1:8000` with `homeNewNoteOpensDraft: true`, `notebookNewNoteDraftVisible: true`, `notebookNewNoteCreatesSourceAttachedNote: true`, `notebookNewNoteDraftSourceDefaulted: true`, `notebookSourceAnchorNoteSelectedAfterSave: true`, and `notebookCaptureInReaderStillAvailable: true`.
