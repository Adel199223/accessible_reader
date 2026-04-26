# ExecPlan: Stage 858 Study Lead-Band Command Row Compaction And Work-Surface Lift After Stage 857

## Summary
- Keep `Study` intentionally reopened after the Stage 857 Review prompt-first checkpoint.
- Compress the organizer-wide Study lead band into one command-row surface shared by `Review` and `Questions`.
- Preserve Review prompt-first ownership, Questions fused canvas ownership, evidence preview, Reader handoff, focused Reader-led Study, and all non-Study baselines.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, mark the Study lead band as the Stage 858 command row while keeping the existing metrics, `Review / Questions` toggle, and single `Refresh` action.
- In `frontend/src/index.css`, render the lead as one compact command row: mode/status copy on the left, metric pills in the middle, and inline status plus actions on the right.
- Lift the Review active card and Questions filters closer to the command row without reintroducing duplicate prompt or Questions manager chrome.
- Extend targeted Study tests and the shared Study Playwright harness with command-row, lead-height, metric-pill, current-summary, Review-card offset, and Questions-filter offset evidence.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/study_review_dashboard_reset_shared.mjs`
- `node --check` on `scripts/playwright/stage858_study_lead_band_command_row_compaction_after_stage857.mjs`
- `node --check` on `scripts/playwright/stage859_post_stage858_study_lead_band_command_row_compaction_audit.mjs`
- `node scripts/playwright/stage858_study_lead_band_command_row_compaction_after_stage857.mjs`
- `node scripts/playwright/stage859_post_stage858_study_lead_band_command_row_compaction_audit.mjs`
- `git diff --check`

## Outcome
- Implemented in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- The organizer-wide Study lead now carries the Stage 858 command-row marker and renders as one compact shared row for both `Review` and `Questions`.
- Dashboard metric tiles are now compact metric pills, and the current review / questions summary is an inline status seam instead of a bordered summary card.
- Review prompt-first ownership from Stage 857 stayed intact, with the active review card lifted to `studyReviewCardTopOffset: 129.71875`.
- Questions fused ownership from Stage 855 stayed intact, with filters starting at `studyQuestionsFiltersTopOffset: 131.671875`.
- Targeted and live validation passed with `studyLeadBandCommandRowCompact: true`, `studyLeadBandHeight: 97.78125`, `studyLeadMetricTilesVisible: false`, `studyLeadCurrentSummaryCardVisible: false`, `studyQuestionsLeadBandCommandRowCompact: true`, and `runtimeBrowser: msedge`.
