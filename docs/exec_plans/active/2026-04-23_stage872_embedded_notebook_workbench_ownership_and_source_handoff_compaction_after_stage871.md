# ExecPlan: Stage 872 Embedded Notebook Workbench Ownership And Source-Handoff Compaction After Stage 871

## Summary
- Reopen embedded `Notebook` intentionally from the completed Stage 870/871 Home mixed-preview baseline.
- Make the desktop Notebook workspace feel Library-native and note-first instead of a heavy hero plus browse/detail/dashboard stack.
- Preserve source selection, search, note edit/save/delete, Reader/source handoff, Graph promotion, Study card creation, focused Reader-led Notebook, and all Home/Reader/Graph/Study baselines.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, collapse the desktop Notebook hero into one compact command row with source/note context, note count, anchored sentence count, search, and `New note` where available.
- Flatten `Browse notebook` into a list-owned rail by removing the oversized browse explainer/glance card while keeping source selection, search, rows, active selection, and metadata.
- Fuse `Note detail`, highlighted passage, editor, save state, source handoff, and promotion into one selected-note workbench surface; source and promotion actions should become attached inline seams, not detached right-column cards.
- Keep focused Reader-led Notebook behavior as a regression surface rather than redesigning it.

## Validation
- targeted Notebook/App Vitest
- `npm run build`
- backend graph pytest
- `node --check` on the shared harness plus Stage 872/873 scripts
- live Stage 872/873 browser runs
- `git diff --check`

## Completion Evidence
- Implemented the desktop embedded Notebook command-row, flattened browse rail, fused selected-note workbench, and inline source/promotion seams in `frontend/src/components/RecallWorkspace.tsx` plus the matching CSS and targeted tests.
- Preserved focused Reader-led Notebook as a regression surface.
- Green checks completed for targeted Notebook Vitest, full `App.test.tsx`, frontend build, backend graph pytest, Stage 872/873 `node --check`, and live Stage 872/873 browser runs.
