# ExecPlan: Stage 862 Study Review Active-Card Single-Surface Fusion After Stage 861

## Summary
- Keep `Study` intentionally reopened after the Stage 861 support-rail checkpoint.
- Fuse the organizer-wide default `Review` workspace into one active-card surface so the prompt, reveal, answer, rating, metadata, and evidence context read as one work object.
- Preserve the Stage 859 command row, Stage 861 evidence-first support rail, Stage 855 `Questions` canvas, focused Reader-led Study, and all non-Study baselines.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, move the visible `Review` heading into the active review card seam and retire the detached manager-header feel.
- Retire the nested prompt-panel shell and detached reveal band from organizer-wide `Study > Review`.
- Render the prompt, quiet source/status/evidence metadata, `Show answer`, answer content, and rating buttons inside the same active review surface.
- In `frontend/src/index.css`, replace the stacked card/panel styling with one flatter fused Review card whose internal seams stay attached.
- Extend targeted Study tests and the shared Study Playwright harness with single-surface, no-nested-prompt, no-detached-reveal, and attached answer/rating evidence.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on Stage 862/863 Playwright scripts
- live Stage 862/863 browser runs
- `git diff --check`

## Outcome
- Implemented in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Organizer-wide `Study > Review` now renders as one active-card surface with the visible `Review` heading, prompt, quiet metadata seam, `Show answer`, answer, and rating controls attached inside the same card.
- The legacy nested prompt-card shell, detached reveal band, detached manager-header ownership, answer panel slab, and rating slab are retired for the default Review path.
- Targeted and live validation passed with `studyReviewActiveCardSingleSurface: true`, `studyReviewNestedPromptPanelVisible: false`, `studyReviewDetachedRevealBandVisible: false`, `studyReviewDetachedManagerHeaderVisible: false`, `studyReviewAnswerAttachedToCard: true`, and `studyReviewRatingAttachedToCard: true`.
