# ExecPlan: Stage 885 Post-Stage-884 Home Local Preview Fidelity And Card Identity Audit

## Summary
- Validate Stage 884 against the live local app on `http://127.0.0.1:8000`.
- Confirm default `Captures` cards gain stronger local preview identity without regressing Stage 871 Web/Documents rendered-preview preservation.
- Confirm Add Content, Graph, embedded Notebook, Reader, Study Review, Study Questions, hidden Home, and organizer-visible Matches remain stable.

## Audit Focus
- Capture default Captures with local preview-fidelity metrics for meaningful local posters, generic fallback count, variant count, and density preservation.
- Capture selected Web and Documents boards to prove meaningful rendered previews remain available when assets exist.
- Reconfirm Stage 829-871 Home baselines: four-across density, shared lead band, single-row toolbar, footer depth, selected-card metadata cleanup, organizer rail rhythm, hidden-state ownership, compact hidden reopen strip, and no clipping.
- Keep regression captures for Add Content route stability, Graph, embedded Notebook, original-only Reader, Reader active Listen, Study Review, and Study Questions.

## Validation
- targeted Home/App Vitest
- `npm run build`
- backend graph pytest
- Stage 884/885 `node --check`
- live Stage 884/885 Playwright runs
- `git diff --check`
