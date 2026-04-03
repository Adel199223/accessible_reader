# Stage 761 - Post-Stage-760 Reader Short-Document Article-Field Compaction Audit

## Summary

- Audit the completed Stage 760 `Reader` short-document article-field compaction against the current live localhost app.
- Confirm that genuinely short documents no longer sit inside the old tall article slab in active Reader.
- Verify that the idle transport, Source reopening, nearby Notebook reopening, generated Summary affordances, and wider Recall regression surfaces all stay stable.

## What Changed

- Reader now applies a compact article-field treatment only when the current document is genuinely short.
- Longer documents keep the existing standard article-field footprint.
- The change is content-aware, so Reader still preserves the calmer long-form reading lane while trimming unnecessary empty depth for short sources.

## Validation

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage760_reader_short_document_article_field_compaction_after_stage759.mjs scripts/playwright/stage761_post_stage760_reader_short_document_article_field_compaction_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage760_reader_short_document_article_field_compaction_after_stage759.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage761_post_stage760_reader_short_document_article_field_compaction_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Audit Result

- The Stage 761 audit recorded `defaultArticleFieldHeight: 320`, `defaultArticleFieldShortDocument: true`, `defaultReaderVisibleTransportButtonLabels: Start read aloud`, `defaultReaderVisibleUtilityLabels: More reading controls`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenArticleFieldHeight: 320`, `notebookOpenArticleFieldShortDocument: true`, `notebookOpenWorkbenchVisible: true`, `summaryArticleFieldPresent: false`, `summaryReaderGeneratedEmptyStateVisible: true`, `summaryReaderCreateSummaryVisible: true`, and `simplifiedViewAvailable: false`.
- `Home`, `Graph`, embedded `Notebook`, and `Study` stayed stable in the same live browser validation on `http://127.0.0.1:8000`.

## Continuity Notes

- Stage 760 is the latest green implementation checkpoint.
- Stage 761 is the latest completed audit.
- Future work should resume from `post-Stage 761 Reader baseline`.
