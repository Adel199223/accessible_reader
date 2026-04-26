# ExecPlan: Stage 863 Post-Stage-862 Study Review Active-Card Single-Surface Fusion Audit

## Summary
- Audit Stage 862 after the Study Review active-card fusion lands.
- Confirm organizer-wide `Review` renders as one prompt-first work surface without nested prompt, detached manager header, detached reveal, answer, or rating slabs.
- Keep `Questions`, focused Reader-led Study, `Home`, `Graph`, embedded `Notebook`, and original-only `Reader` as regression captures only.

## Audit Focus
- Capture wide `Study > Review` evidence that the main card is one fused work surface.
- Capture answer-shown evidence that answer and rating remain attached to the same card.
- Capture `Study > Questions` evidence that the Stage 855/861 fused Questions canvas and compact handoff remain intact.
- Preserve Stage 859 command-row and Stage 861 support-rail protections while adding Stage 862 active-card metrics.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on the shared Study harness plus Stage 862/863 scripts
- live Stage 862/863 browser runs
- `git diff --check`

## Outcome
- Completed after Stage 862 implementation.
- Live Edge evidence captured wide `Study > Review`, answer-shown Review, wide `Study > Questions`, focused Reader-led Study, `Home`, `Graph`, embedded `Notebook`, and original-only `Reader`.
- The audit confirmed the single-surface Review model: `studyReviewActiveCardSingleSurface: true`, `studyReviewNestedPromptPanelVisible: false`, `studyReviewDetachedRevealBandVisible: false`, `studyReviewDetachedManagerHeaderVisible: false`, `studyReviewAnswerAttachedToCard: true`, and `studyReviewRatingAttachedToCard: true`.
- Stage 859 and Stage 861 baselines stayed intact with `studyLeadBandCommandRowCompact: true`, `studySupportDockSingleRailCompact: true`, `studyReviewQueuePreviewAtRestCount: 1`, `studyQuestionsReviewHandoffCompact: true`, and `studyEvidenceReaderHandoffVisible: true`.
- Regression evidence stayed green with `focusedGoodRatingVisible: true`, `homeVisible: true`, `graphCanvasVisible: true`, `notebookVisible: true`, and `notesSidebarVisible: false`.
