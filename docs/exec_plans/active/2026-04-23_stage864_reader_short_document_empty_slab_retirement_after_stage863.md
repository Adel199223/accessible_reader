# ExecPlan: Stage 864 Reader Short-Document Empty-Slab Retirement After Stage 863

## Summary
- Reopen `Reader` intentionally from the completed Stage 862/863 Study checkpoint.
- Retire the oversized empty article slab for very short original/reflowed Reader documents.
- Preserve the compact Reader header, source seam, read-aloud controls, Source/Notebook expansion, long-document behavior, and frozen generated outputs.

## Implementation Focus
- In `frontend/src/components/ReaderWorkspace.tsx`, reuse the existing `readerShortDocumentLayout` detection to expose a short-document, at-rest article-field hook without adding new state.
- In `frontend/src/index.css`, make that short-document article field content-fit with tighter padding/min-height while leaving long/preview-backed article fields unchanged.
- Extend Reader-focused Vitest coverage for original and reflowed short documents, long/preview-backed stability, read-aloud availability, and generated-output invariants.
- Extend the shared Reader Playwright audit with explicit short-document empty-slab, content-fit, long-document stability, and read-aloud metrics.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on the shared Reader harness and Stage 864/865 scripts
- live Stage 864/865 browser runs
- `git diff --check`

## Outcome
- Implemented the short-document, at-rest content-fit hook in `ReaderWorkspace` for `Original` and `Reflowed` only, leaving expanded Source/Notebook support, long/preview-backed articles, and generated modes on their existing layouts.
- Added compact CSS for the short-document article field so the old roughly 320px empty slab is no longer reserved at rest.
- Extended Reader Vitest and the shared Reader Playwright audit with `readerShortDocumentEmptySlabVisible`, `readerShortDocumentArticleFieldContentFit`, `readerShortDocumentArticleFieldHeight`, `readerLongDocumentArticleFieldStable`, `readerGeneratedOutputsFrozen`, and `readerShortDocumentReadAloudAvailable`.
- Live Stage 864/865 validation recorded `readerShortDocumentEmptySlabVisible: false`, `readerShortDocumentArticleFieldContentFit: true`, `readerShortDocumentArticleFieldHeight: 64.969`, `defaultArticleFieldContentFitStage864: true`, `reflowedArticleFieldContentFitStage864: true`, `readerLongDocumentArticleFieldStable: true`, `readerGeneratedOutputsFrozen: true`, and `readerShortDocumentReadAloudAvailable: true`.
