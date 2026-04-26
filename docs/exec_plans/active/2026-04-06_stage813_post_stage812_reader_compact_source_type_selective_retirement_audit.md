# Stage 813 - Post-Stage-812 Reader Compact Source-Type Selective Retirement Audit

## Summary

- Validate the Stage 812 compact Reader selective source-type retirement pass against the live local app on `http://127.0.0.1:8000`.
- Confirm the compact Reader seam drops the low-signal `PASTE` label while preserving informative imported-source labels such as `HTML`, along with the nearby Notebook handoff and the rest of the compact Reader baseline.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage812_reader_compact_source_type_selective_retirement_after_stage811.mjs`
- `node --check scripts/playwright/stage813_post_stage812_reader_compact_source_type_selective_retirement_audit.mjs`
- `node scripts/playwright/stage812_reader_compact_source_type_selective_retirement_after_stage811.mjs`
- `node scripts/playwright/stage813_post_stage812_reader_compact_source_type_selective_retirement_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Record the live local result in `output/playwright/stage813-post-stage812-reader-compact-source-type-selective-retirement-audit-validation.json`.
- Expect the default compact Reader seam to remove the visible `PASTE` label while keeping the note-count handoff visible, and expect preview-backed compact Reader to retain an informative source-type label.
- Reconfirm `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` on the live browser dataset.
- Result: passed on April 6, 2026 against `http://127.0.0.1:8000`.
- Recorded evidence: `defaultReaderSourceTypeVisible: false`, `defaultReaderSourceStripMetaLabels: 173 notes`, `reflowedReaderSourceTypeVisible: false`, `previewBackedReaderSourceInlineTextLabels: HTML`, `previewBackedReaderSourceStripMetaLabels: HTML / 1 note`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, `simplifiedViewAvailable: false`, and `runtimeBrowser: chromium`.
