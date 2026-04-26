# ExecPlan: Stage 829 Post-Stage-828 Home Open Board Above-the-Fold Density Lift Audit

## Summary
- Audit the Stage 828 follow-through against the remaining open `Home` density gap after the hidden-state cleanup through Stage 827.
- Confirm that the default open organizer-visible Home board now feels denser above the fold, with a four-across first row including `Add content` at benchmark width.
- Keep hidden `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while open `Home` stays the active reopen.

## Audit Result
- The Stage 829 live Edge audit passed with `runtimeBrowser: msedge`.
- The default open organizer-visible `Home` board now reads as a denser above-the-fold working canvas, recording `homeOpenOverviewFirstRowTileCount: 4`, `homeOpenOverviewGridColumnCount: 5`, `homeOpenOverviewAddTileHeroScaleVisible: false`, `homeOpenOverviewAddTileHeight: 161.265625`, and `homeOpenOverviewCardHeight: 161.265625`.
- The first visible day group now fits four tiles across including `Add content` at the benchmark desktop width, and the `Add content` tile no longer dominates the board as a hero slab.
- The earlier Home organizer and hidden-state fixes stayed intact with `homeOrganizerHeaderOverlapDetected: false`, `homeOrganizerLauncherTopAnchored: true`, `homeHiddenControlDeckVisible: false`, `homeHiddenReopenStripCompact: true`, `homeHiddenBoardStartsAfterLauncher: true`, and `homeVisibleClippingCount: 0`.
- Regression captures remained stable for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage828_home_open_board_above_the_fold_density_lift_after_stage827.mjs`
- `node --check` on `scripts/playwright/stage829_post_stage828_home_open_board_above_the_fold_density_lift_audit.mjs`
- `node scripts/playwright/stage828_home_open_board_above_the_fold_density_lift_after_stage827.mjs`
- `node scripts/playwright/stage829_post_stage828_home_open_board_above_the_fold_density_lift_audit.mjs`
- `git diff --check`
