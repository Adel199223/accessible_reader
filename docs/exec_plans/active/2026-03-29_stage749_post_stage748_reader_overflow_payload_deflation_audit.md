# Stage 749 - Post-Stage-748 Reader Overflow Payload Deflation Audit

## Summary

- Audited the intentional Stage 748 Reader cleanup in live browser validation on `http://127.0.0.1:8000`.
- Confirmed the compact Reader source strip now retires the generic `Local source` fallback for the current paste-backed default document while keeping the inline `Source` trigger and right-side metadata intact.
- Confirmed the Reader overflow now contains only actionable controls: `Settings`, `Source`, `Notebook`, voice selection, and rate control, with the passive sentence-progress chip and shortcut sentence removed in both default and Summary idle states.

## Validation

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage748_reader_overflow_payload_deflation_after_stage747.mjs scripts/playwright/stage749_post_stage748_reader_overflow_payload_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage748_reader_overflow_payload_deflation_after_stage747.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage749_post_stage748_reader_overflow_payload_deflation_audit.mjs"`

## Audit Highlights

- `defaultAvailableModes: original / reflowed`
- `defaultReaderVisibleViewLabels: Original / Reflowed`
- `defaultReaderVisibleTransportButtonLabels: Start read aloud`
- `defaultReaderVisibleUtilityLabels: More reading controls`
- `defaultReaderOverflowActionLabels: Settings / Source / Notebook`
- `defaultReaderOverflowVoiceVisible: true`
- `defaultReaderOverflowRateVisible: true`
- `defaultReaderOverflowSentenceLabelVisible: false`
- `defaultReaderOverflowShortcutHintVisible: false`
- `defaultReaderSourcePreviewText: null`
- `defaultReaderSourceNavTriggerVisible: true`
- `defaultReaderSourceStripMetaLabels: PASTE / 87 notes`
- `summaryReaderOverflowActionLabels: Settings / Source / Notebook`
- `summaryReaderOverflowVoiceVisible: true`
- `summaryReaderOverflowRateVisible: true`
- `summaryReaderOverflowSentenceLabelVisible: false`
- `summaryReaderOverflowShortcutHintVisible: false`
- `summaryReaderVisibleViewLabels: Original / Reflowed / Summary`
- `simplifiedViewAvailable: false`

## Evidence

- Validation JSON:
  - `output/playwright/stage749-post-stage748-reader-overflow-payload-deflation-audit-validation.json`
- Key captures:
  - `output/playwright/stage749-reader-default-wide-top.png`
  - `output/playwright/stage749-reader-control-overflow.png`
  - `output/playwright/stage749-reader-source-strip.png`
  - `output/playwright/stage749-reader-summary-wide-top.png`
