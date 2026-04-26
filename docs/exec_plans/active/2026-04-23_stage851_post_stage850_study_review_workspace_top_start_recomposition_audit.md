# ExecPlan: Stage 851 Post-Stage-850 Study Review Workspace Top-Start Recomposition Audit

## Summary
- Audit the Stage 850 Study review workspace recomposition against the wide-desktop Recall-parity mismatch.
- Confirm that the empty upper-left dead zone is gone, the compact review lead band appears above the fold, the active review card starts directly underneath it, and the right support surfaces stay top-aligned without dominating the page.
- Keep `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, and focused Reader-led `Study` as regression captures beneath the refreshed Study baseline.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on `scripts/playwright/stage850_study_review_workspace_top_start_recomposition_after_stage849.mjs`
- `node --check` on `scripts/playwright/stage851_post_stage850_study_review_workspace_top_start_recomposition_audit.mjs`
- `node scripts/playwright/stage850_study_review_workspace_top_start_recomposition_after_stage849.mjs`
- `node scripts/playwright/stage851_post_stage850_study_review_workspace_top_start_recomposition_audit.mjs`
- `git diff --check`

## Audit Result
- Passed. The wide Study review workspace now starts at the top-left with a compact review lead band and no visible upper-left dead zone, while support surfaces, answer rating, evidence, focused Reader-led Study, and cross-surface regressions stayed intact.
- Key audit metrics:
  - `studyTopStartDeadZoneVisible: false`
  - `studyReviewLeadBandAboveFold: true`
  - `studyReviewStageTopOffset: 230.3125`
  - `studyDashboardHeroShellVisible: false`
  - `studySupportDockTopAligned: true`
  - `studyQuestionsViewTopStartCompact: true`
  - `goodRatingVisible: true`
  - `focusedGoodRatingVisible: true`
  - `homeVisible: true`
  - `graphCanvasVisible: true`
  - `notebookVisible: true`
  - `notesSidebarVisible: false`
  - `runtimeBrowser: chromium`

## Regression Note
- The same live audit kept the default open `Home` board, Graph canvas, embedded `Notebook`, original-only `Reader`, and focused Reader-led `Study` stable beneath the refreshed Study baseline.
