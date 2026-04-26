# ExecPlan: Stage 866 Reader Short-Document Support-Open Continuity And Compact Workbench Preservation After Stage 865

## Summary
- Reopen `Reader` intentionally from the completed Stage 864/865 short-document baseline.
- Extend the short-document content-fit and compact header/deck treatment so opening `Source` or `Notebook` does not restore the old tall empty slab.
- Preserve long-document behavior, Source/Notebook functionality, read-aloud, and frozen generated outputs.

## Implementation Focus
- In `frontend/src/components/ReaderWorkspace.tsx`, add one short-document support-open continuity flag for `Original` and `Reflowed`, and reuse it to keep the compact source/header model and content-fit article field alive when support is expanded.
- In `frontend/src/index.css`, add a support-open short-document deck/layout variant that keeps the article top-aligned beside the expanded dock without reviving the old tall framed slab.
- Extend `frontend/src/App.test.tsx` for short `Original` + `Source` open, short `Reflowed` + `Notebook` open, and long-document support-open stability.
- Extend the shared Reader Playwright audit and new Stage 866/867 scripts with support-open compactness and empty-slab metrics plus article-field evidence captures.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on the shared Reader harness and Stage 866/867 scripts
- live Stage 866/867 browser runs
- `git diff --check`

## Outcome
- Completed Stage 866 by extending the Stage 864 short-document content-fit treatment through support-open `Source` and `Notebook` states in `ReaderWorkspace`, while preserving long-document layout, Source/Notebook behavior, read-aloud, and frozen generated outputs.
- Added the compact support-open short-document deck variant and kept the shared compact source/header ownership alive when support is expanded.
- Extended Vitest and the shared Reader Playwright harness so short support-open continuity is measured directly instead of inferred from the older Stage 865 captures.
