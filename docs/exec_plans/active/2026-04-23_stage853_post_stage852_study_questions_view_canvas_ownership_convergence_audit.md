# ExecPlan: Stage 853 Post-Stage-852 Study Questions View Canvas Ownership Convergence Audit

## Summary
- Audit the Stage 852 Study Questions canvas-ownership convergence against the remaining Study Recall-parity mismatch.
- Confirm that `Questions` becomes the primary canvas mode, that the right support dock no longer duplicates the full question list, and that the Stage 851 Review top-start baseline remains intact.
- Keep `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, and focused Reader-led `Study` as regression captures beneath the refreshed Study baseline.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on `scripts/playwright/stage852_study_questions_view_canvas_ownership_convergence_after_stage851.mjs`
- `node --check` on `scripts/playwright/stage853_post_stage852_study_questions_view_canvas_ownership_convergence_audit.mjs`
- `node scripts/playwright/stage852_study_questions_view_canvas_ownership_convergence_after_stage851.mjs`
- `node scripts/playwright/stage853_post_stage852_study_questions_view_canvas_ownership_convergence_audit.mjs`
- `git diff --check`

## Audit Result
- Completed with live browser evidence on `http://127.0.0.1:8000`.
- Stage 853 confirmed:
  - `studyQuestionsViewPrimaryCanvasVisible: true`
  - `studyQuestionsViewReviewStageVisible: false`
  - `studyQuestionsSupportDockListVisible: false`
  - `studyQuestionsManagerTopStartCompact: true`
  - `studyQuestionsReviewHandoffVisible: true`
  - `studyQuestionsActiveRowListState: true`
  - `studyTopStartDeadZoneVisible: false`
  - `studyReviewLeadBandAboveFold: true`
  - `studyDashboardHeroShellVisible: false`
  - `studySupportDockTopAligned: true`
  - `homeVisible: true`
  - `graphCanvasVisible: true`
  - `notebookVisible: true`
  - `notesSidebarVisible: false`
  - `focusedGoodRatingVisible: true`
- Evidence artifacts include:
  - `output/playwright/stage853-study-wide-top.png`
  - `output/playwright/stage853-study-questions-wide-top.png`
  - `output/playwright/stage853-study-questions-manager-wide-top.png`
  - `output/playwright/stage853-study-review-handoff-wide-top.png`
  - `output/playwright/stage853-study-answer-shown-wide-top.png`
  - `output/playwright/stage853-focused-study-narrow-top.png`
  - `output/playwright/stage853-home-wide-top.png`
  - `output/playwright/stage853-graph-wide-top.png`
  - `output/playwright/stage853-notebook-wide-top.png`
  - `output/playwright/stage853-reader-reader-original-wide-top.png`
