# Stage 803 - Post-Stage-802 Reader Compact Embedded-Control Height Deflation Audit

## Summary

- Validate the Stage 802 compact Reader embedded-control height deflation pass against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader keeps the fused header row while slimming the embedded tabs plus `Read aloud` control height.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage802_reader_compact_embedded_control_height_deflation_after_stage801.mjs`
- `node --check scripts/playwright/stage803_post_stage802_reader_compact_embedded_control_height_deflation_audit.mjs`
- `node scripts/playwright/stage802_reader_compact_embedded_control_height_deflation_after_stage801.mjs`
- `node scripts/playwright/stage803_post_stage802_reader_compact_embedded_control_height_deflation_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Recorded the live local result in `output/playwright/stage803-post-stage802-reader-compact-embedded-control-height-deflation-audit-validation.json`.
- Stage 803 proved the compact Reader fused header still shares one row while using slimmer embedded tabs plus a slimmer primary `Read aloud` control on the live Microsoft Edge dataset.
- The audit recorded `defaultReaderEmbeddedCompactControlDensity: true`, `defaultReaderEmbeddedModeTabHeight: 26.297`, `defaultReaderEmbeddedPrimaryTransportHeight: 41.266`, `reflowedReaderEmbeddedCompactControlDensity: true`, `reflowedReaderEmbeddedModeTabHeight: 25.406`, `reflowedReaderEmbeddedPrimaryTransportHeight: 41.266`, `previewBackedReaderEmbeddedCompactControlDensity: true`, `summaryReaderEmbeddedCompactControlDensity: true`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, `simplifiedViewAvailable: false`, and `runtimeBrowser: msedge`.
- Source reopening, Notebook reopening, and the wider Reader baseline stayed stable on the same audit run.
