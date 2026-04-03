# Stage 767 - Post-Stage-766 Reader Derived Metadata Deflation Audit

## Summary

- Audit the completed Stage 766 `Reader` derived metadata cleanup against the current live localhost app.
- Confirm that derived Reader modes no longer repeat source provenance, selected summary detail, or low-value readiness state in a second chip row when those cues are already present elsewhere in the same block.
- Verify that meaningful additive metadata, nearby Notebook reopening, Source reopening, short-document article-field treatment, and wider Recall regression surfaces all stay stable.

## What Changed

- Derived Reader modes now keep provenance in the title row instead of repeating it as another chip.
- Summary detail stays visible through the segmented detail control instead of repeating as a `Balanced detail` chip.
- Missing generated modes no longer spend metadata space on `Ready to generate`; reflowed no longer spends metadata space on `Local derived view`.
- The derived metadata row collapses entirely when no additive metadata remains.

## Validation

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage766_reader_derived_metadata_deflation_after_stage765.mjs scripts/playwright/stage767_post_stage766_reader_derived_metadata_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage766_reader_derived_metadata_deflation_after_stage765.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage767_post_stage766_reader_derived_metadata_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Audit Result

- Passed. The Stage 767 live audit confirmed `notebookOpenReaderDerivedContextActionLabels: Notebook`, `notebookOpenReaderDerivedContextMetaLabels: none`, `notebookOpenReaderDerivedContextSummaryVisible: true`, `notebookOpenReaderDerivedContextHeight: 68`, `summaryReaderDerivedContextActionLabels: Notebook / Reflowed view`, `summaryReaderDerivedContextMetaLabels: none`, `summaryReaderDerivedContextSummaryVisible: false`, `summaryReaderDerivedContextHeight: 145.031`, `summaryReaderGeneratedEmptyStateNestedInDerivedContext: true`, `summaryReaderGeneratedEmptyStateVisible: true`, `summaryReaderCreateSummaryVisible: true`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` while `Home`, `Graph`, embedded `Notebook`, and `Study` stayed stable in live browser validation on `127.0.0.1:8000` (`runtimeBrowser: chromium`).

## Continuity Notes

- Stage 766 is the latest implementation checkpoint for Reader derived metadata deflation.
- Stage 767 is the matching post-implementation audit.
- Future work should resume from `post-Stage 767 Reader baseline`.
