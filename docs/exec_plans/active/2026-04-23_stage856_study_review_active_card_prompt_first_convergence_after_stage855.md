# ExecPlan: Stage 856 Study Review Active-Card Prompt-First Convergence After Stage 855

## Summary
- Keep `Study` intentionally reopened after the Stage 855 Questions fused lead-band checkpoint.
- Make the default organizer-wide Review path prompt-first by letting the lead band own metrics, view switching, and refresh while the main canvas owns one active review card.
- Preserve Stage 854/855 `Questions`, focused Reader-led Study, local review state, evidence preview, Reader handoff, and cross-surface baselines.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, stop rendering the active prompt inside the Review lead band and replace the stacked Review manager/glance/prompt chrome with one active-card surface.
- Keep the active prompt visible once in the main review card, with source/status/evidence metadata as a quiet seam and reveal/answer/rating attached to that card.
- Deflate the Review right queue dock by removing its duplicate refresh and evidence-preview actions; keep preview and Reader handoff owned by `Grounding`.
- Extend targeted Study tests and the shared Study Playwright harness with prompt ownership and duplicate-control metrics.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on `scripts/playwright/stage856_study_review_active_card_prompt_first_convergence_after_stage855.mjs`
- `node --check` on `scripts/playwright/stage857_post_stage856_study_review_active_card_prompt_first_convergence_audit.mjs`
- `node scripts/playwright/stage856_study_review_active_card_prompt_first_convergence_after_stage855.mjs`
- `node scripts/playwright/stage857_post_stage856_study_review_active_card_prompt_first_convergence_audit.mjs`
- `git diff --check`

## Outcome
- Implemented in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- The default organizer-wide `Study > Review` lead band no longer repeats the active prompt; it keeps compact queue/status context, metrics, `Review / Questions`, and one `Refresh`.
- The main Review canvas now renders one prompt-first active review card with prompt, metadata seam, reveal, answer, and rating attached; the old detached flow row, current-question glance, and separate prompt panel are retired.
- The Review queue support dock no longer owns duplicate `Preview evidence` or `Refresh`; evidence preview and Reader handoff remain owned by `Grounding`.
- Targeted and live validation passed with `studyReviewActiveCardPromptFirst: true`, `studyReviewPromptSurfaceCount: 1`, `studyReviewLeadPromptDuplicateVisible: false`, `studyReviewGlancePanelVisible: false`, `studyReviewDuplicateRefreshControls: false`, `studyReviewQueueDockUtilityStripVisible: false`, and `studyReviewQueueDockEvidencePreviewVisible: false`.
