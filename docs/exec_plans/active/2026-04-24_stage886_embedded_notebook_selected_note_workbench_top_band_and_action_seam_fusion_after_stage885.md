# ExecPlan: Stage 886 Embedded Notebook Selected-Note Workbench Top-Band And Action-Seam Fusion After Stage 885

## Summary
- Reopen embedded `Notebook` intentionally from the completed Stage 884/885 Home preview-fidelity baseline.
- Make the selected-note desktop Notebook path feel note-first and Library-native by fusing the command row with the selected-note lead and flattening the note workbench chrome.
- Preserve Stage 872/873 selected-note behavior and Stage 874/875 no-active-note/search-empty behavior while reducing duplicated headings, nested panels, and visibly sectioned handoff/promotion seams.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, fuse the desktop Notebook command row and selected-note `Note detail` lead into one compact note-owned top band when a note is active.
- Keep source selection, notebook search, note/source counts, active source context, `Capture in Reader`, edit/save/delete, Reader/source handoff, Graph promotion, and Study card creation behavior unchanged.
- Compress the selected-note body so the highlighted passage and note editor read as two panes inside one workbench surface, with source and promote actions demoted to compact inline seams.
- Keep focused Reader-led Notebook, no-active-note, and search-empty paths as regression surfaces only.

## Validation
- targeted Notebook/App Vitest
- `npm run build`
- backend graph pytest
- `node --check` on the shared Notebook harness and Stage 886/887 scripts
- live Stage 886/887 browser runs
- `git diff --check`
