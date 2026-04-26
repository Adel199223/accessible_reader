# ExecPlan: Stage 835 Post-Stage-834 Home Open Board Continuation Fill And Footer Pushdown Audit

## Summary
- Audit the Stage 834 follow-through against the remaining open `Home` continuation-depth parity gap.
- Confirm that organizer-visible open `Home` now carries more real document cards before the footer and no longer shows `Show all captures` above the first benchmark viewport.
- Keep hidden `Home`, open `Matches`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while the open selected board stays the active parity surface.

## Audit Result
- The Stage 835 live browser audit passed with `runtimeBrowser: msedge`.
- The organizer-visible open selected board now carries materially more real continuation before the footer, recording `homeOpenOverviewContinuationCarryExtended: true`, `homeOpenOverviewVisibleDocumentTileCount: 24`, `homeOpenOverviewVisibleDayGroupCount: 3`, `homeOpenOverviewFooterVisible: true`, and `homeOpenOverviewFooterVisibleAboveFold: false`.
- The Stage 829-833 open-board gains stayed intact in the same run with `homeOpenOverviewFirstRowTileCount: 4`, `homeOpenOverviewGridColumnCount: 5`, `homeOpenOverviewAddTileHeroScaleVisible: false`, `homeOpenOverviewLeadBandSharedRow: true`, `homeOpenOverviewToolbarSingleRow: true`, `homeOpenOverviewToolbarSecondaryRowVisible: false`, and `homeOpenOverviewTopStartCompact: true`.
- Open `Matches` stayed stable with `homeOpenMatchesToolbarSingleRow: true`, while the earlier hidden-state and organizer-shell fixes also remained green with `homeOrganizerHeaderOverlapDetected: false`, `homeOrganizerLauncherTopAnchored: true`, `homeHiddenControlDeckVisible: false`, `homeHiddenBoardStartsAfterLauncher: true`, `homeHiddenReopenStripCompact: true`, and `homeVisibleClippingCount: 0`.
- Regression captures remained stable for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage834_home_open_board_continuation_fill_and_footer_pushdown_after_stage833.mjs`
- `node --check` on `scripts/playwright/stage835_post_stage834_home_open_board_continuation_fill_and_footer_pushdown_audit.mjs`
- `node scripts/playwright/stage834_home_open_board_continuation_fill_and_footer_pushdown_after_stage833.mjs`
- `node scripts/playwright/stage835_post_stage834_home_open_board_continuation_fill_and_footer_pushdown_audit.mjs`
- `git diff --check`
