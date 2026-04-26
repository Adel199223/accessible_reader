# ExecPlan: Stage 865 Post-Stage-864 Reader Short-Document Empty-Slab Retirement Audit

## Summary
- Validate Stage 864 against the live local app on `http://127.0.0.1:8000`.
- Confirm short original/reflowed Reader documents no longer render the large empty article slab.
- Confirm long Reader documents, generated modes, Source/Notebook expansion, and the current Home/Graph/Notebook/Study baselines remain stable.

## Audit Focus
- Capture original and reflowed short-document Reader states and record that the article field is content-fit.
- Capture a long/preview-backed Reader state and record that the long-document article field remains stable.
- Reconfirm read-aloud availability, source/title seam continuity, Source and Notebook reopen behavior, and generated-output invariants.
- Keep regression captures for default open `Home`, `Graph`, embedded `Notebook`, `Study Review`, and `Study Questions`.

## Validation
- targeted Reader Vitest
- `npm run build`
- backend graph pytest
- Stage 864/865 `node --check`
- live Stage 864/865 Playwright runs
- `git diff --check`

## Outcome
- The live Stage 865 audit confirmed short original and reflowed Reader captures now use the content-fit article field and do not show the old empty slab.
- Recorded `readerShortDocumentEmptySlabVisible: false`, `readerShortDocumentArticleFieldContentFit: true`, `readerShortDocumentArticleFieldHeight: 64.969`, `defaultArticleFieldHeight: 64.969`, `reflowedArticleFieldHeight: 64.969`, `previewBackedArticleFieldShortDocument: false`, `readerLongDocumentArticleFieldStable: true`, `readerGeneratedOutputsFrozen: true`, and `readerShortDocumentReadAloudAvailable: true`.
- Reconfirmed `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` while preserving the compact Reader header/control ribbon and leaving Home, Graph, Notebook, and Study as regression captures.
