# Stage 765 - Post-Stage-764 Reader Derived Lead-In Deduplication Audit

## Summary

- Audit the completed Stage 764 `Reader` derived lead-in cleanup against the current live localhost app.
- Confirm that derived Reader modes no longer show the redundant descriptor badge and that generated Summary state no longer keeps the extra context paragraph above the empty-state copy.
- Verify that the deduplicated derived header, nearby Notebook reopening, Source reopening, short-document article-field treatment, and wider Recall regression surfaces all stay stable.

## What Changed

- Reader derived modes now rely on the mode title plus provenance chips instead of repeating a separate descriptor badge above them.
- Generated `Summary` and `Simplified` empty states no longer keep the extra context paragraph above the inline empty-state message.
- The derived-context shell is slightly tighter while keeping the same nearby actions and generated affordances.

## Validation

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage764_reader_derived_lead_in_deduplication_after_stage763.mjs scripts/playwright/stage765_post_stage764_reader_derived_lead_in_deduplication_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage764_reader_derived_lead_in_deduplication_after_stage763.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage765_post_stage764_reader_derived_lead_in_deduplication_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Audit Result

- The Stage 765 audit recorded `notebookOpenReaderDerivedContextActionLabels: Notebook`, `notebookOpenReaderDerivedContextDescriptorVisible: false`, `notebookOpenReaderDerivedContextSummaryVisible: true`, `summaryReaderDerivedContextActionLabels: Notebook / Reflowed view`, `summaryReaderDerivedContextDescriptorVisible: false`, `summaryReaderDerivedContextSummaryVisible: false`, `summaryReaderDerivedContextHeight: 176.219`, `summaryReaderGeneratedEmptyStateNestedInDerivedContext: true`, `summaryReaderGeneratedEmptyStateVisible: true`, `summaryReaderCreateSummaryVisible: true`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- `Home`, `Graph`, embedded `Notebook`, and `Study` stayed stable in the same live browser validation on `http://127.0.0.1:8000`.

## Continuity Notes

- Stage 764 is the latest implementation checkpoint for Reader derived lead-in deduplication.
- Stage 765 is the matching post-implementation audit.
- Future work should resume from `post-Stage 765 Reader baseline`.
