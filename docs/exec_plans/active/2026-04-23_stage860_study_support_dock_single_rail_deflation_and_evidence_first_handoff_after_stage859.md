# ExecPlan: Stage 860 Study Support Dock Single-Rail Deflation And Evidence-First Handoff After Stage 859

## Summary
- Keep `Study` intentionally reopened after the Stage 859 command-row checkpoint.
- Deflate the organizer-wide right support dock in `Review` and `Questions` so secondary context reads as one lighter evidence-first rail.
- Preserve the Stage 859 command row, Stage 857 prompt-first Review card, Stage 855 Questions canvas, evidence preview, Reader handoff, focused Reader-led Study, and all non-Study baselines.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, mark the organizer-wide Study support dock as the Stage 860 single-rail model.
- In `Review`, reduce `Questions due` from a competing support card into a compact queue seam and show at most one upcoming question preview at rest.
- In `Questions`, compact `Review handoff` into a thin selected-question seam with one visible `Review` action.
- In `frontend/src/index.css`, remove the heavy card-stacked rail feel, keep `Grounding` / answer-shown `Evidence` top-aligned, and attach evidence actions plus excerpts more tightly.
- Extend targeted Study tests and the shared Study Playwright harness with single-rail, preview-count, compact-handoff, helper-copy, and Reader-handoff evidence.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on `scripts/playwright/stage860_study_support_dock_single_rail_deflation_after_stage859.mjs`
- `node --check` on `scripts/playwright/stage861_post_stage860_study_support_dock_single_rail_deflation_audit.mjs`
- `node scripts/playwright/stage860_study_support_dock_single_rail_deflation_after_stage859.mjs`
- `node scripts/playwright/stage861_post_stage860_study_support_dock_single_rail_deflation_audit.mjs`
- `git diff --check`

## Outcome
- Implemented in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- The organizer-wide Study support dock now carries the Stage 860 single-rail marker and renders queue or handoff plus `Grounding` / `Evidence` as one attached rail.
- In `Review`, the queue support seam now shows at most one upcoming question preview at rest and no longer duplicates evidence preview, refresh, or Grounding helper copy.
- In `Questions`, `Review handoff` is now a compact selected-question seam with one visible `Review` action while the full queue remains canvas-owned.
- Targeted and live validation passed with `studySupportDockSingleRailCompact: true`, `studySupportDockSeparateCardCount: 0`, `studyReviewQueuePreviewAtRestCount: 1`, `studyQuestionsReviewHandoffCompact: true`, `studyGroundingHelperCopyVisible: false`, and `studyEvidenceReaderHandoffVisible: true`.
