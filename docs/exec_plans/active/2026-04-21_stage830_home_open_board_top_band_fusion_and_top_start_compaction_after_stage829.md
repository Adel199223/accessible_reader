# ExecPlan: Stage 830 Home Open Board Top-Band Fusion And Top-Start Compaction After Stage 829

## Summary
- Keep `Home` as the active Recall-parity surface and stay on the default organizer-visible overview board.
- Remove the remaining separate toolbar band above the open board so the first visible day-group work starts earlier.
- Fuse the first visible day header and the existing board toolbar into one shared lead band without reopening hidden-state work or another card-density-only pass.

## Scope
- In the organizer-visible open `Home` overview, board mode only, stop rendering the toolbar as a standalone row above the board content.
- Render the first visible day group with a shared top band: day header on the left, existing `Search...` / `Add` / `New note` / `List` / `Sort` cluster on the right.
- Reduce the open-board top padding and the first lead-band-to-grid gap while preserving the Stage 829 density lift, chronology, `Add content` tile placement, organizer ownership, and toolbar actions.
- Leave hidden `Home`, hidden `Captures`, hidden `Matches`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Acceptance
- The open Home toolbar no longer consumes its own row above the first visible day-group work.
- The first visible day header and toolbar share one lead band in organizer-visible open board mode.
- The first visible day header starts materially earlier in the canvas than the Stage 829 baseline while keeping the Stage 829 four-across density model intact.
- List view, collection filtering, organizer reopen behavior, hidden-state ownership, and cross-surface regressions stay unchanged.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage830_home_open_board_top_band_fusion_and_top_start_compaction_after_stage829.mjs`
- `node --check` on `scripts/playwright/stage831_post_stage830_home_open_board_top_band_fusion_and_top_start_compaction_audit.mjs`
- Stage 830 live Edge validation
