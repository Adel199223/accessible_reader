# ExecPlan: Stage 867 Post-Stage-866 Reader Short-Document Support-Open Continuity And Compact Workbench Preservation Audit

## Summary
- Validate Stage 866 against the live local app on `http://127.0.0.1:8000`.
- Confirm short original/reflowed Reader documents stay compact and content-fit even when `Source` or `Notebook` support is open.
- Confirm long Reader documents, generated modes, and the current Home/Graph/Notebook/Study baselines remain stable.

## Audit Focus
- Capture short-document `Source`-open and `Notebook`-open Reader states and record that the article field stays content-fit and the compact shared header/deck model survives.
- Reconfirm at-rest short-document behavior so Stage 865 remains intact.
- Capture a long/preview-backed Reader state and record that the long-document article field remains stable.
- Keep regression captures for default open `Home`, `Graph`, embedded `Notebook`, `Study Review`, `Study Questions`, and generated Reader modes.

## Validation
- targeted Reader Vitest
- `npm run build`
- backend graph pytest
- Stage 866/867 `node --check`
- live Stage 866/867 Playwright runs
- `git diff --check`

## Outcome
- Stage 867 completed against the live local app on `http://127.0.0.1:8000`.
- The audit confirmed `readerShortDocumentSupportOpenEmptySlabVisible: false`, `readerShortDocumentSourceOpenArticleFieldContentFit: true`, `readerShortDocumentNotebookOpenArticleFieldContentFit: true`, `readerShortDocumentSupportOpenCompactHeaderSharedRow: true`, `readerShortDocumentSupportOpenDeckCompact: true`, `sourceOpenArticleFieldHeight: 64.969`, `notebookOpenArticleFieldHeight: 64.969`, `readerLongDocumentArticleFieldStable: true`, `readerGeneratedOutputsFrozen: true`, `readerShortDocumentReadAloudAvailable: true`, and `runtimeBrowser: msedge`.
- Regression captures remained green for default open `Home`, `Graph`, embedded `Notebook`, `Study Review`, `Study Questions`, and generated Reader modes.
