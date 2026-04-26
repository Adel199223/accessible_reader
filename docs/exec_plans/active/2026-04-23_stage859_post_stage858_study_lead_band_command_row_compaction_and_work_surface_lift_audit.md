# ExecPlan: Stage 859 Post-Stage-858 Study Lead-Band Command Row Compaction And Work-Surface Lift Audit

## Summary
- Audit Stage 858 after the Study command-row compaction lands.
- Confirm organizer-wide `Review` and `Questions` both start work directly under a compact lead row instead of a tall dashboard slab.
- Keep `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, and focused Reader-led `Study` as regression captures only.

## Audit Focus
- Capture wide `Study > Review` evidence that the command row is compact, metric tiles have become pills, the current-summary card chrome is gone, and the active review card starts higher.
- Capture wide `Study > Questions` evidence that the same command row is reused and filters begin directly under it.
- Capture answer-shown evidence that reveal, answer, rating, evidence preview, and Reader handoff remain attached to the prompt-first Review card and Grounding support.
- Preserve the Stage 855/857 duplicate-chrome protections while adding Stage 858 geometry metrics.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on the shared Study harness plus Stage 858/859 scripts
- live Stage 858/859 browser runs
- `git diff --check`

## Outcome
- Completed after Stage 858 implementation.
- Live Edge evidence captured wide `Study > Review`, wide `Study > Questions`, answer-shown Review, focused Reader-led Study, `Home`, `Graph`, embedded `Notebook`, and original-only `Reader`.
- The audit confirmed the tall Study dashboard slab is gone: `studyLeadBandCommandRowCompact: true`, `studyLeadBandHeight: 97.78125`, `studyLeadMetricTilesVisible: false`, and `studyLeadCurrentSummaryCardVisible: false`.
- Work-surface lift held in both modes: `studyReviewCardTopOffset: 129.71875`, `studyQuestionsFiltersTopOffset: 131.671875`, and `studyQuestionsLeadBandCommandRowCompact: true`.
- Regression evidence stayed green with `studyReviewActiveCardPromptFirst: true`, `studyReviewPromptSurfaceCount: 1`, `goodRatingVisible: true`, `focusedGoodRatingVisible: true`, `homeVisible: true`, `graphCanvasVisible: true`, `notebookVisible: true`, and `notesSidebarVisible: false`.
