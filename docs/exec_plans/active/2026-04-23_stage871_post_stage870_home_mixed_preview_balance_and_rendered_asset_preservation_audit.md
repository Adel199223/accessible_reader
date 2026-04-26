# ExecPlan: Stage 871 Post-Stage-870 Home Mixed Preview Balance And Rendered-Asset Preservation Audit

## Summary
- Validate Stage 870 against the live local app on `http://127.0.0.1:8000`.
- Confirm default `Captures` remains text-first/non-generic while selected `Web` and `Documents` boards preserve rendered visual previews when assets exist.
- Confirm hidden Home, organizer-visible Matches, Graph, embedded Notebook, Reader, and Study remain stable.

## Audit Focus
- Capture default Captures, selected Web, and selected Documents Home boards with mixed-preview metrics.
- Record text-first weak-local counts, rendered-preview counts, preview-mode diversity, and whether meaningful rendered previews were preserved.
- Reconfirm Stage 869 Home baselines: density, shared top band, single-row toolbar, footer below fold, organizer list rhythm, hidden board ownership, compact hidden reopen strip, and no clipping.
- Keep regression captures for Graph, embedded Notebook, original-only Reader, Reader support-open short docs, Study Review, and Study Questions.

## Validation
- targeted Home/App Vitest
- `npm run build`
- backend graph pytest
- Stage 870/871 `node --check`
- live Stage 870/871 Playwright runs
- `git diff --check`
