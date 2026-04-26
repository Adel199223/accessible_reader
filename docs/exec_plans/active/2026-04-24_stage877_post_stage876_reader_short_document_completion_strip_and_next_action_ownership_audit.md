# Stage 877 - Post-Stage-876 Reader Short-Document Completion Strip And Next-Action Ownership Audit

## Summary

- Audit the Stage 876 Reader short-document completion strip.
- Confirm that short at-rest `Original` and `Reflowed` documents keep the compact content-fit article field while gaining a compact next-action seam under the article.

## Evidence Targets

- `readerShortDocumentCompletionStripVisible`
- `readerShortDocumentFirstViewportDeadZoneVisible`
- `readerShortDocumentCompletionStripHeight`
- `readerShortDocumentSourceHandoffVisible`
- `readerShortDocumentNotebookHandoffVisible`
- `readerLongDocumentCompletionStripVisible`
- `readerSupportOpenShortDocumentContentFitStable`
- `readerGeneratedOutputsFrozen`

## Regression Targets

- Stage 866/867 support-open short `Source` and `Notebook` continuity.
- Long/preview-backed Reader layout stays on the current long-document article field.
- Generated `Simplified` / `Summary` output behavior stays frozen.
- Home, Graph, embedded Notebook, Study Review, and Study Questions remain regression surfaces.

## Validation

- Targeted Reader/App Vitest.
- `npm run build`.
- `cd backend && uv run pytest tests/test_api.py -k graph -q`.
- `node --check` on the shared Reader harness plus Stage 876/877 scripts.
- Live Stage 876/877 browser runs.
- `git diff --check`.
