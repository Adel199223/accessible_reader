# Stage 791 - Post-Stage-790 Reader Document-Open Topbar Compaction Audit

## Summary

- Validate the Stage 790 Reader topbar compaction against the live local app on `http://127.0.0.1:8000`.
- Confirm active Reader documents no longer show the redundant visible `Reader` heading in the shell topbar while `Search` and `Add` remain available.
- Reconfirm Source reopening, Notebook reopening, and the wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/components/RecallShellFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"compact shell styling keeps Reader support collapsed at rest and expandable on demand\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage790_reader_document_open_topbar_compaction_after_stage789.mjs scripts/playwright/stage791_post_stage790_reader_document_open_topbar_compaction_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage790_reader_document_open_topbar_compaction_after_stage789.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage791_post_stage790_reader_document_open_topbar_compaction_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- The live local result is recorded in `output/playwright/stage791-post-stage790-reader-document-open-topbar-compaction-audit-validation.json`.
- The active Reader document state confirmed `defaultReaderTopbarActionLabels: SearchCtrl+K / Add`, `defaultReaderTopbarCompact: true`, `defaultReaderTopbarHeight: 50.297`, and `defaultReaderTopbarTitleVisible: false`.
- The same compact topbar behavior held in the live `Reflowed` and preview-backed checks with `reflowedReaderTopbarCompact: true` and `previewBackedReaderTopbarTitleVisible: false`.
- The wider Reader and Recall regressions stayed stable with `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`, alongside the existing compact Reader chrome.
