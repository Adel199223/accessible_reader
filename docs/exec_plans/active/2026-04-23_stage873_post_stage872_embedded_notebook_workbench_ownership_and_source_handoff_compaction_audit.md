# ExecPlan: Stage 873 Post-Stage-872 Embedded Notebook Workbench Ownership And Source-Handoff Compaction Audit

## Summary
- Validate Stage 872 against the live local app on `http://127.0.0.1:8000`.
- Confirm embedded Notebook no longer shows the old top hero, browse-glance panel, detached source-handoff card, or detached promotion card.
- Confirm selected-note editing, source/Reader handoff, Graph promotion, Study promotion, focused Reader-led Notebook, Home, Reader, Graph, and Study regressions remain stable.

## Audit Focus
- Capture wide embedded Notebook and selected-note workbench crops.
- Record metrics for compact command-row ownership, list-owned browse rail, single-surface editor ownership, inline source handoff, and inline promotion actions.
- Keep regression captures for Home Stage 871 preview balance, Graph, original-only Reader, Reader support-open short docs, Study Review, and Study Questions.

## Validation
- targeted Notebook/App Vitest
- `npm run build`
- backend graph pytest
- Stage 872/873 `node --check`
- live Stage 872/873 Playwright runs
- `git diff --check`

## Audit Result
- Live Stage 873 audit passed on `http://127.0.0.1:8000` with Windows Edge evidence.
- Notebook metrics recorded `notebookTopHeroVisible: false`, `notebookCommandRowCompact: true`, `notebookBrowsePanelChromeVisible: false`, `notebookEditorSingleSurface: true`, `notebookDetachedSourceHandoffCardVisible: false`, `notebookDetachedPromoteCardVisible: false`, `notebookSourceHandoffInlineVisible: true`, and `notebookPromoteActionsInlineVisible: true`.
- Regression evidence kept the Stage 871 Home mixed-preview metrics, Graph canvas, original-only Reader, Reader support-open short docs, Study Review, and Study Questions baselines green.
