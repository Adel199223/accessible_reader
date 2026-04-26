# Stage 801 - Post-Stage-800 Reader Compact Header-Row Fusion Audit

## Summary

- Validate the Stage 800 compact Reader header-row fusion pass against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader now keeps source identity and active reading controls inside one unified header block before the article.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage800_reader_compact_header_row_fusion_after_stage799.mjs`
- `node --check scripts/playwright/stage801_post_stage800_reader_compact_header_row_fusion_audit.mjs`
- `node scripts/playwright/stage800_reader_compact_header_row_fusion_after_stage799.mjs`
- `node scripts/playwright/stage801_post_stage800_reader_compact_header_row_fusion_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Record the live local result in `output/playwright/stage801-post-stage800-reader-compact-header-row-fusion-audit-validation.json`.
- Stage 801 proved the compact Reader source seam and compact control cluster now share one header block while expanded Source and Notebook reopen cleanly.
- The live audit recorded `defaultReaderControlRibbonEmbeddedInSourceWorkspace: true`, `defaultReaderCompactHeaderSharedRow: true`, `defaultReaderSourceToControlGap: 0`, `reflowedReaderControlRibbonEmbeddedInSourceWorkspace: true`, `previewBackedReaderControlRibbonEmbeddedInSourceWorkspace: true`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, `simplifiedViewAvailable: false`, and `runtimeBrowser: msedge`.
- Source reopening, Notebook reopening, and the wider Reader baseline stayed stable on the same audit run.
