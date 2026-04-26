# ExecPlan: Stage 854 Study Questions Lead-Band Fusion And Duplicate Chrome Retirement After Stage 853

## Summary
- Keep `Study` intentionally reopened after the Stage 853 Questions canvas-ownership checkpoint.
- Retire the remaining duplicated Questions chrome by letting the top Study lead band own the Questions heading, metrics, `Review / Questions` toggle, and single `Refresh` action.
- Keep Review mode, local FSRS/review state, evidence preview, Reader handoff, focused Reader-led Study, and all non-Study surfaces unchanged.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, keep `Questions` as the primary canvas mode while removing the duplicate manager header/actions and selected-summary block from the Questions canvas.
- Start the `All / New / Due / Scheduled` filters and question rows directly under the fused Questions lead band.
- Preserve the Stage 853 right support dock model: compact `Review handoff` plus existing `Grounding`, with no full question list in the dock.
- Extend `frontend/src/App.test.tsx` and the shared Study Playwright harness to assert no duplicated manager header, no duplicate refresh/review controls, no selected-summary canvas block, and filters starting directly under the lead band.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on `scripts/playwright/stage854_study_questions_lead_band_fusion_and_duplicate_chrome_retirement_after_stage853.mjs`
- `node --check` on `scripts/playwright/stage855_post_stage854_study_questions_lead_band_fusion_and_duplicate_chrome_retirement_audit.mjs`
- `node scripts/playwright/stage854_study_questions_lead_band_fusion_and_duplicate_chrome_retirement_after_stage853.mjs`
- `node scripts/playwright/stage855_post_stage854_study_questions_lead_band_fusion_and_duplicate_chrome_retirement_audit.mjs`
- `git diff --check`

## Outcome
- Implemented. Organizer-wide `Study` still opens on the compact Review baseline, and selecting `Questions` now converts the top Study lead band into the single Questions-owned lead row with compact metrics, the `Review / Questions` toggle, and one `Refresh` action.
- The duplicate Questions manager header/actions and canvas-level selected-question summary block are retired, so filters and question rows start directly under the fused lead band while the right dock remains compact `Review handoff` plus `Grounding`.
- Validation recorded `studyQuestionsLeadBandDuplicated: false`, `studyQuestionsManagerHeaderDuplicated: false`, `studyQuestionsDuplicateRefreshControls: false`, `studyQuestionsSelectedSummaryCanvasVisible: false`, `studyQuestionsFiltersStartUnderLeadBand: true`, and `studyQuestionsCanvasTopOffset: 220.0625` in live browser evidence.
