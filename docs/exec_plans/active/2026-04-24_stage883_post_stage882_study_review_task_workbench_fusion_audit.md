# Stage 883 - Post-Stage-882 Study Review Task-Workbench Fusion Audit

## Summary

- Audit the Stage 882 Study Review task-workbench fusion.
- Confirm default wide Study Review now reads as one compact review-owned workbench while preserving Questions, Reader, Home, Graph, Add Content, and embedded Notebook baselines.

## Evidence Targets

- `studyReviewTaskWorkbenchFused`
- `studyReviewCommandRowInsideWorkbench`
- `studyReviewCommandToCardGap`
- `studyReviewActiveCardPanelWeightReduced`
- `studyReviewSupportRailCompetingCardCount`
- `studyReviewGroundingAttached`
- `studyReviewQueuePreviewAtRestCount`
- `studyQuestionsCanvasStable`

## Regression Targets

- Study still opens on `Review`.
- Review/Questions toggle, metrics, inline status, and one `Refresh` action remain available.
- Prompt appears once; reveal, answer, rating buttons, evidence preview, and Reader handoff remain functional.
- Questions view remains canvas-owned with filters, rows, compact handoff, and no duplicate manager chrome.
- Home Stage 871, Add Content Stage 881, Graph Stage 849, embedded Notebook Stage 873/875, Reader Stage 879, and focused Reader-led Study remain regression surfaces.

## Validation

- Targeted Study/App Vitest.
- `npm run build`.
- `cd backend && uv run pytest tests/test_api.py -k graph -q`.
- `node --check` on the shared Study harness plus Stage 882/883 scripts.
- Live Stage 882/883 browser runs.
- `git diff --check`.
