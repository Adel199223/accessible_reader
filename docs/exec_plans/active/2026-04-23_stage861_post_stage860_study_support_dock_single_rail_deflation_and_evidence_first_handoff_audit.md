# ExecPlan: Stage 861 Post-Stage-860 Study Support Dock Single-Rail Deflation And Evidence-First Handoff Audit

## Summary
- Audit Stage 860 after the Study support-dock deflation lands.
- Confirm organizer-wide `Review` and `Questions` keep the Stage 859 command-row work surfaces while the right support column becomes one lighter evidence-first rail.
- Keep `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, and focused Reader-led `Study` as regression captures only.

## Audit Focus
- Capture wide `Study > Review` evidence that the support rail no longer renders as two heavy competing cards.
- Capture wide `Study > Review` evidence that the queue seam shows compact queue context and at most one upcoming preview.
- Capture wide `Study > Questions` evidence that `Review handoff` is compact, selected-question owned, and keeps one visible `Review` action without duplicating the question manager.
- Capture answer-shown evidence that rating, answer, `Evidence`, evidence preview, and Reader handoff remain usable and attached.
- Preserve Stage 855/857/859 protections while adding Stage 860 support-rail metrics.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on the shared Study harness plus Stage 860/861 scripts
- live Stage 860/861 browser runs
- `git diff --check`

## Outcome
- Completed after Stage 860 implementation.
- Live Edge evidence captured wide `Study > Review`, wide `Study > Questions`, answer-shown Review, focused Reader-led Study, `Home`, `Graph`, embedded `Notebook`, and original-only `Reader`.
- The audit confirmed the support dock now reads as one evidence-first rail: `studySupportDockSingleRailCompact: true`, `studySupportDockSeparateCardCount: 0`, `studyReviewQueuePreviewAtRestCount: 1`, `studyQuestionsReviewHandoffCompact: true`, `studyGroundingHelperCopyVisible: false`, and `studyEvidenceReaderHandoffVisible: true`.
- Stage 859 and Stage 857 baselines stayed intact with `studyLeadBandCommandRowCompact: true`, `studyReviewActiveCardPromptFirst: true`, `studyReviewPromptSurfaceCount: 1`, and `studyQuestionsLeadBandCommandRowCompact: true`.
- Regression evidence stayed green with `goodRatingVisible: true`, `focusedGoodRatingVisible: true`, `homeVisible: true`, `graphCanvasVisible: true`, `notebookVisible: true`, and `notesSidebarVisible: false`.
