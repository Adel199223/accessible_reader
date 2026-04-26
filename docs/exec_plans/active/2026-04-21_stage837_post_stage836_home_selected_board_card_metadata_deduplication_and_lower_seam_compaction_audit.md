# ExecPlan: Stage 837 Post-Stage-836 Home Selected-Board Card Metadata Deduplication And Lower-Seam Compaction Audit

## Summary
- Audit the Stage 836 follow-through against the remaining selected-board card rhythm gap on organizer-visible `Home`.
- Confirm that selected-board cards no longer repeat the lower collection chip while the quieter source row still survives beneath the title.
- Keep organizer-visible open `Matches`, hidden `Home`, hidden `Captures`, hidden `Matches`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while the selected open board stays the active parity surface.

## Audit Result
- The Stage 837 live browser audit passed with `runtimeBrowser: msedge`.
- The organizer-visible selected open board now records `homeOpenOverviewCollectionChipVisible: false`, `homeOpenOverviewSourceRowVisible: true`, and `homeOpenOverviewLowerMetaSingleRow: true`, confirming that the repeated lower collection chip is gone while the quieter source row still survives beneath the title.
- Organizer-visible open `Matches` stayed intentionally richer with `homeOpenMatchesCollectionChipVisible: true`, while the earlier open-board gains remained intact in the same run with `homeOpenOverviewFirstRowTileCount: 4`, `homeOpenOverviewGridColumnCount: 5`, `homeOpenOverviewLeadBandSharedRow: true`, `homeOpenOverviewToolbarSingleRow: true`, `homeOpenOverviewFooterVisibleAboveFold: false`, and `homeOpenOverviewContinuationCarryExtended: true`.
- Hidden `Home`, hidden `Captures`, hidden `Matches`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` all stayed stable with `homeHiddenControlDeckVisible: false`, `homeHiddenBoardStartsAfterLauncher: true`, `homeHiddenReopenStripCompact: true`, `homeOrganizerLauncherTopAnchored: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage836_home_selected_board_card_metadata_deduplication_and_lower_seam_compaction_after_stage835.mjs`
- `node --check` on `scripts/playwright/stage837_post_stage836_home_selected_board_card_metadata_deduplication_and_lower_seam_compaction_audit.mjs`
- `node scripts/playwright/stage836_home_selected_board_card_metadata_deduplication_and_lower_seam_compaction_after_stage835.mjs`
- `node scripts/playwright/stage837_post_stage836_home_selected_board_card_metadata_deduplication_and_lower_seam_compaction_audit.mjs`
- `git diff --check`
