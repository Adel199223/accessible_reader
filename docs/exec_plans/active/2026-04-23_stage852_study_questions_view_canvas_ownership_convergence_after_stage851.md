# ExecPlan: Stage 852 Study Questions View Canvas Ownership Convergence After Stage 851

## Summary
- Reopen `Study` after the Stage 851 review top-start baseline because the `Questions` path still behaves like a support-dock expansion while the main canvas remains Review-owned.
- Make `Questions` a first-class Study canvas mode while preserving the default Review landing, compact review lead band, review/rating flow, evidence preview, Reader handoff, and focused Reader-led Study.
- Keep `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, backend contracts, and Reader generated outputs unchanged.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, render a primary Questions manager beneath the compact Study lead band whenever the organizer-wide `Questions` view is selected.
- Move the existing filters, question rows, active selection, refresh, and show-all behavior into that canvas-owned manager, and flatten the active selected row from heavy panel chrome into list-state chrome.
- Replace the right support-dock question list in `Questions` mode with a compact review handoff / selected-question summary plus the existing evidence support.
- Extend `frontend/src/App.test.tsx` plus `scripts/playwright/study_review_dashboard_reset_shared.mjs` so the Questions view now asserts canvas ownership and no duplicate support-dock list.

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

## Outcome
- Implemented in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- `Questions` now renders a primary `Study questions manager` in the main canvas with filters, rows, refresh, show-all behavior, and flattened active-row list-state chrome.
- Selecting a question now updates the active Study card without leaving `Questions`; returning to Review is an explicit `Review` / `Return to review` handoff.
- The right support dock in `Questions` mode no longer duplicates the full question list and instead renders compact `Study review handoff` plus the existing `Study evidence support`.
- Validation passed:
  - `npm run test -- --run src/App.test.tsx -t "Study Questions"`
  - `npm run test -- --run src/App.test.tsx`
  - `npm run build`
  - `cd backend && uv run pytest tests/test_api.py -k graph -q`
  - `node --check scripts/playwright/study_review_dashboard_reset_shared.mjs`
  - `node --check scripts/playwright/stage852_study_questions_view_canvas_ownership_convergence_after_stage851.mjs`
  - `node --check scripts/playwright/stage853_post_stage852_study_questions_view_canvas_ownership_convergence_audit.mjs`
  - `node scripts/playwright/stage852_study_questions_view_canvas_ownership_convergence_after_stage851.mjs`
  - `node scripts/playwright/stage853_post_stage852_study_questions_view_canvas_ownership_convergence_audit.mjs`
