# Stage 747 - Post-Stage-746 Reader Settings-Trigger Demotion Audit

## Summary

- Audit the Stage 746 Reader settings-trigger demotion pass in the live browser.
- Confirm the active-reading ribbon now keeps only the primary `Read aloud` action plus the existing overflow trigger visible at rest.
- Verify that `Settings`, `Source`, and `Notebook` remain reachable from overflow while Source-open, Notebook-open, and generated-mode states stay stable.

## Audit Focus

### Required confirmations

- Default Reader no longer shows a standalone active-reading `Settings` gear beside the primary transport.
- Default Reader keeps only one visible secondary utility trigger at rest: `More reading controls`.
- Default Reader overflow now includes `Settings`, `Source`, and `Notebook`.
- The compact source-strip trigger, reading-band widths, and idle transport compaction remain intact.
- Source-open and Notebook-open support flows still reopen normally from the same Reader session.
- Summary-capable state keeps the same quieter visible utility set.

### Regression guardrails

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend, route, or cross-surface behavior changes outside regression proof.
- No loss of the empty-state Settings entry when no document is open.
- No removal of the compact source-strip trigger or expanded Source / Notebook workspace behavior.

## Validation Evidence

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage746_reader_settings_trigger_demotion_after_stage745.mjs scripts/playwright/stage747_post_stage746_reader_settings_trigger_demotion_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage746_reader_settings_trigger_demotion_after_stage745.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage747_post_stage746_reader_settings_trigger_demotion_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Result

- Passed. The Stage 747 audit recorded `defaultReaderVisibleUtilityLabels: More reading controls`, `defaultReaderOverflowActionLabels: Settings / Source / Notebook`, `defaultReaderVisibleTransportButtonLabels: Start read aloud`, `defaultReaderSourceNavTriggerVisible: true`, `defaultReaderSourceStripMetaLabels: PASTE / 86 notes`, `defaultReaderControlRibbonWidthRatio: 0.773`, `sourceOpenReaderSourceTabsVisible: true`, `notebookOpenWorkbenchVisible: true`, `summaryReaderVisibleUtilityLabels: More reading controls`, `summaryReaderVisibleTransportButtonLabels: Start read aloud`, `summaryReaderVisibleViewLabels: Original / Reflowed / Summary`, and `simplifiedViewAvailable: false`.
