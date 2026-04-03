# Stage 783 - Post-Stage-782 Reader Active Note Tile Compaction Audit

## Summary

- Validate the Stage 782 Reader Notebook switcher compaction against the live local app on `http://127.0.0.1:8000`.
- Confirm the active saved-note tile no longer remains in the switcher once that note is already open in the selected-note workbench.
- Reconfirm Source reopening, Notebook reopening, generated-output freeze, and the wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage782_reader_active_note_tile_compaction_after_stage781.mjs scripts/playwright/stage783_post_stage782_reader_active_note_tile_compaction_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage782_reader_active_note_tile_compaction_after_stage781.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage783_post_stage782_reader_active_note_tile_compaction_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Passed on the live local app and recorded the new baseline in `output/playwright/stage783-post-stage782-reader-active-note-tile-compaction-audit-validation.json`.
- The Stage 783 audit confirmed `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenReaderSavedNoteActiveTileVisible: false`, `notebookOpenReaderSavedNoteButtonCount: 131`, `notebookOpenReaderNoteWorkbenchPreviewMetaText: 2 anchored sentences`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- The Reader Notebook rail now behaves like a real switcher plus editor: the active note lives only in the selected-note workbench, while the saved-note list stays reserved for the other nearby notes.
