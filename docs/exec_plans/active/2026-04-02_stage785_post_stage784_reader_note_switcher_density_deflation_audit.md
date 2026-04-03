# Stage 785 - Post-Stage-784 Reader Note Switcher Density Deflation Audit

## Summary

- Validate the Stage 784 Reader Notebook switcher compaction against the live local app on `http://127.0.0.1:8000`.
- Confirm nearby saved-note buttons now collapse to the anchor plus one supporting line instead of the older three-layer preview-card treatment.
- Reconfirm the active note stays retired from the switcher, the selected-note workbench remains intact below, and the wider Recall regressions still hold in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage784_reader_note_switcher_density_deflation_after_stage783.mjs scripts/playwright/stage785_post_stage784_reader_note_switcher_density_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage784_reader_note_switcher_density_deflation_after_stage783.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage785_post_stage784_reader_note_switcher_density_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Passed on the live local app and recorded the new baseline in `output/playwright/stage785-post-stage784-reader-note-switcher-density-deflation-audit-validation.json`.
- The Stage 785 audit confirmed `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenReaderSavedNoteActiveTileVisible: false`, `notebookOpenReaderSavedNoteButtonCount: 134`, `notebookOpenReaderSavedNoteExcerptVisible: false`, `notebookOpenReaderSavedNoteSecondaryVisible: true`, `notebookOpenReaderSavedNoteTextLayerCount: 2`, `notebookOpenReaderSavedNoteMaxHeight: 87.531`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- The Reader Notebook rail now behaves like a denser navigator above the selected-note editor: nearby notes keep one compact supporting line, while the fuller anchor preview and editor context remain in the workbench below.
