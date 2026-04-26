# Stage 805 - Post-Stage-804 Reader Read-Aloud Primary Action Finish Audit

## Summary

- Validate the Stage 804 compact Reader `Read aloud` primary-action finish against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader keeps a full visible `Read aloud` pill with a speech-specific start icon inside the fused compact header.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage804_reader_read_aloud_primary_action_finish_after_stage803.mjs`
- `node --check scripts/playwright/stage805_post_stage804_reader_read_aloud_primary_action_finish_audit.mjs`
- `node scripts/playwright/stage804_reader_read_aloud_primary_action_finish_after_stage803.mjs`
- `node scripts/playwright/stage805_post_stage804_reader_read_aloud_primary_action_finish_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Recorded the live local result in `output/playwright/stage805-post-stage804-reader-read-aloud-primary-action-finish-audit-validation.json`.
- Stage 805 proved compact Reader now keeps a full visible `Read aloud` pill with a speech-specific idle icon across default, Reflowed, and preview-backed states on the live Microsoft Edge dataset.
- The audit recorded `defaultReaderPrimaryTransportLabelClipped: false`, `defaultReaderPrimaryTransportUsesSpeechIcon: true`, `defaultReaderPrimaryTransportWidth: 107.125`, `reflowedReaderPrimaryTransportLabelClipped: false`, `reflowedReaderPrimaryTransportUsesSpeechIcon: true`, `reflowedReaderPrimaryTransportWidth: 107.125`, `previewBackedReaderPrimaryTransportLabelClipped: false`, `previewBackedReaderPrimaryTransportUsesSpeechIcon: true`, `previewBackedReaderPrimaryTransportWidth: 107.125`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, `simplifiedViewAvailable: false`, and `runtimeBrowser: msedge`.
- Source reopening, Notebook reopening, and the wider Reader baseline stayed stable on the same audit run.
