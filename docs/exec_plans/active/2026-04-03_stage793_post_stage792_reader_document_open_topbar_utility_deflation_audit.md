# Stage 793 - Post-Stage-792 Reader Document-Open Topbar Utility Deflation Audit

## Summary

- Validate the Stage 792 Reader topbar-utility deflation against the live local app on `http://127.0.0.1:8000`.
- Confirm active Reader documents keep `Search` and `Add` available while shrinking the utility footprint and retiring the visible compact-topbar shortcut hint.
- Reconfirm Source reopening, Notebook reopening, and the wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/components/RecallShellFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"compact shell styling keeps Reader support collapsed at rest and expandable on demand\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage792_reader_document_open_topbar_utility_deflation_after_stage791.mjs scripts/playwright/stage793_post_stage792_reader_document_open_topbar_utility_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage792_reader_document_open_topbar_utility_deflation_after_stage791.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage793_post_stage792_reader_document_open_topbar_utility_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- The live local result is recorded in `output/playwright/stage793-post-stage792-reader-document-open-topbar-utility-deflation-audit-validation.json`.
- The Stage 793 audit confirmed `defaultReaderTopbarActionLabels: Search / Add`, `defaultReaderTopbarActionsCompact: true`, `defaultReaderTopbarCompact: true`, `defaultReaderTopbarHeight: 41.813`, `defaultReaderTopbarShortcutHintVisible: false`, and `defaultReaderTopbarActionMaxHeight: 41.813`, proving the document-open Reader utility seam is smaller than the Stage 791 topbar while keeping both controls visible.
- Reflowed and preview-backed Reader states matched that same compact topbar treatment, while `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` reconfirmed Source reopening, Notebook reopening, and generated-output invariants remained intact.
