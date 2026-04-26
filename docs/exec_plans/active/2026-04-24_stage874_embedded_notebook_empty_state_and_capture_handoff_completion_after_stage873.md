# Stage 874 - Embedded Notebook Empty-State And Capture-Handoff Completion After Stage 873

## Summary

- Keep the active pass on embedded `Notebook`.
- Finish the adjacent no-active-note and search-empty paths that still depend on older empty-state/dashboard chrome after the Stage 872/873 selected-note workbench cleanup.
- Add a clear Reader capture handoff for the selected source without introducing standalone/manual Notebook note creation.

## Scope

- Update desktop embedded Notebook in `frontend/src/components/RecallWorkspace.tsx`.
- Replace the legacy no-active-note/search-empty guidance stack with compact workbench-owned empty states.
- Keep the Stage 872 command row, browse rail, selected-note fused workbench, source selection, search, note edit/save/delete, Reader handoff, Graph promotion, and Study card creation intact.
- Keep focused Reader-led Notebook as a regression surface only.

## Implementation Notes

- Add a source-owned `Capture in Reader` handoff for the selected source, routed through the existing Reader document-opening path.
- The handoff should open Reader for capture context only; it must not create note data directly.
- Search-empty should stay list/workbench-owned and preserve the selected source context.
- No backend, schema, storage, generated-output, Study scheduling, Graph data, or Home contract changes.

## Validation

- Targeted Notebook/App Vitest for selected-note, no-active-note, search-empty, and Reader capture handoff.
- `node --check` on the shared Notebook harness plus Stage 874/875 scripts.
- Live Stage 874/875 browser evidence when the local app is available.
- Standard build, backend graph test, and `git diff --check`.
