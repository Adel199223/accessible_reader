# Stage 809 - Post-Stage-808 Reader Compact Source Trigger Deflation Audit

## Summary

- Validate the Stage 808 compact Reader source-trigger deflation pass against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader now keeps `Source` as a quieter inline seam trigger instead of an accent-pill badge while preserving the destination menu and reopen behavior.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage808_reader_compact_source_trigger_deflation_after_stage807.mjs`
- `node --check scripts/playwright/stage809_post_stage808_reader_compact_source_trigger_deflation_audit.mjs`
- `node scripts/playwright/stage808_reader_compact_source_trigger_deflation_after_stage807.mjs`
- `node scripts/playwright/stage809_post_stage808_reader_compact_source_trigger_deflation_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Record the live local result in `output/playwright/stage809-post-stage808-reader-compact-source-trigger-deflation-audit-validation.json`.
- Expect compact Reader to show the `Source` destination affordance as inline seam text or link-like chrome instead of a pill badge across default, Reflowed, and preview-backed Reader states.
- Reconfirm `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` on the live Microsoft Edge dataset.
- The live audit passed on `http://127.0.0.1:8000` with `runtimeBrowser: msedge` and `headless: true`.
- Stage 809 recorded `defaultReaderSourceNavTriggerQuietInline: true`, `defaultReaderSourceNavTriggerUsesBadgeChrome: false`, `defaultReaderSourceNavTriggerText: Source`, `reflowedReaderSourceNavTriggerQuietInline: true`, `previewBackedReaderSourceNavTriggerUsesBadgeChrome: false`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
