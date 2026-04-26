# ExecPlan: Stage 869 Post-Stage-868 Home Open Board Card Scanability And Preview Differentiation Audit

## Summary
- Validate Stage 868 against the live local app on `http://127.0.0.1:8000`.
- Confirm organizer-visible Home board cards expose distinguishable above-fold preview signatures instead of repeated local-capture poster chrome.
- Confirm Home hidden states, organizer-visible Matches, Graph, embedded Notebook, Reader, and Study remain stable.

## Audit Focus
- Capture the default open Home overview and first-group crop with Stage 868 preview metrics.
- Record that local capture cards use the text-first hybrid preview treatment while meaningful rendered image previews remain represented.
- Reconfirm Stage 845 Home baselines: density, shared top band, single-row toolbar, footer below fold, organizer list rhythm, hidden board ownership, compact hidden reopen strip, and no clipping.
- Keep regression captures for Graph, embedded Notebook, original-only Reader, Reader support-open short docs, Study Review, and Study Questions.

## Validation
- targeted Home/App Vitest
- `npm run build`
- backend graph pytest
- Stage 868/869 `node --check`
- live Stage 868/869 Playwright runs
- `git diff --check`

