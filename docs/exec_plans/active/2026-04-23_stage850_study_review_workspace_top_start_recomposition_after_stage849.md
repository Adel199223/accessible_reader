# ExecPlan: Stage 850 Study Review Workspace Top-Start Recomposition After Stage 849

## Summary
- Reopen `Study` after the Stage 849 Graph baseline because the wide-desktop review workspace still opens with a large empty upper-left canvas before the review work appears.
- Make the default organizer-wide `Study` review workspace top-start and review-first while preserving local FSRS state, review/rating behavior, evidence preview, Reader handoff, and focused Reader-led Study.
- Keep `Home`, `Graph`, embedded `Notebook`, and original-only `Reader` as regression surfaces only.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, recompose the default desktop Study review layout so the compact review lead band and active review card occupy the top-left primary column while the `Questions due` / `Grounding` support surfaces stay top-aligned on the right.
- In `frontend/src/index.css`, shrink the old `Review ready / Review dashboard` hero into a thinner lead band with compact metrics, tighter top-start spacing, and a small gap before the active review card.
- In `frontend/src/App.test.tsx`, assert that opening Study still lands on `Review`, the compact lead band includes stats, `Review` / `Questions`, `Refresh`, and current-review context, and the review/reveal/rating/evidence/Reader flows remain intact.
- Extend `scripts/playwright/study_review_dashboard_reset_shared.mjs` plus Stage 850/851 wrapper scripts with top-start metrics for the dead-zone retirement, lead-band visibility, support-dock alignment, and Questions compactness.

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

## Outcome
- Implemented. The default wide Study review workspace now starts with a compact review lead band in the upper-left, shows compact `Ready now` / `New` / `Scheduled` / `Logged` metrics in that band, and starts the active review card directly underneath.
- The `Questions due` and `Grounding` support dock now aligns with the review lead instead of leaving a dead upper-left canvas, while Review/Questions switching, reveal/rating, evidence preview, Reader handoff, and focused Reader-led Study stayed intact.

## Implementation Evidence
- `frontend/src/components/RecallWorkspace.tsx` shortened the Study lead copy/title and converted the old dashboard shell into `recall-study-review-lead-band` rather than the old `priority-surface-stage-shell`.
- `frontend/src/index.css` moved the lead band to the left column, compacted metrics/current-review seams, and aligned the review stage plus support dock through explicit grid ownership.
- `frontend/src/App.test.tsx` now asserts the compact lead-band ownership while keeping the active review/rating behavior test green.
- `scripts/playwright/study_review_dashboard_reset_shared.mjs` and the Stage 850/851 wrappers now record top-start dead-zone, lead-band, hero-shell, support-alignment, and Questions-view compactness metrics.
