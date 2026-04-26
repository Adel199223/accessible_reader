# Stage 811 - Post-Stage-810 Reader Duplicate Title Deflation Audit

## Summary

- Validate the Stage 810 compact Reader duplicate-title deflation pass against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader now retires the source-strip title when it exactly repeats the first article heading, while keeping source identity, destination reopening, Notebook reopening, and article rendering intact.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage810_reader_duplicate_title_deflation_after_stage809.mjs`
- `node --check scripts/playwright/stage811_post_stage810_reader_duplicate_title_deflation_audit.mjs`
- `node scripts/playwright/stage810_reader_duplicate_title_deflation_after_stage809.mjs`
- `node scripts/playwright/stage811_post_stage810_reader_duplicate_title_deflation_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Record the live local result in `output/playwright/stage811-post-stage810-reader-duplicate-title-deflation-audit-validation.json`.
- Expect preview-backed compact Reader to reduce the duplicated title count from two visible matching headings down to one visible article heading while preserving the compact `Source` seam and nearby Notebook handoff.
- Reconfirm `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` on the live Microsoft Edge dataset.
- The live audit passed on the current `msedge` dataset: `previewBackedReaderContentHeadingCount: 1`, `previewBackedReaderLeadingArticleHeadingMatchesSourceTitle: true`, `previewBackedReaderSourceTitleVisible: false`, `defaultReaderLeadingArticleHeadingMatchesSourceTitle: false`, `defaultReaderSourceTitleVisible: true`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- Future work should resume from `post-Stage 811 Reader baseline`.
