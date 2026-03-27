# ExecPlan: Stage 615 Home Board-Column Cadence And Add-Tile/Card-Width Balance Reset After Stage 614

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by widening the three-up board columns and bringing the add-tile/card width cadence closer together at wide desktop scale.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No toolbar, rail, grouping, poster-content, or lower-card typography changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The representative card and first-group add tile both widen above the Stage 614 `320px` width baseline.
- First-row right-side slack reduces materially below the Stage 614 baseline without collapsing to four columns.
- The representative card height stays in the compact Stage 613 band instead of regressing taller.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware poster treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage615_home_board_column_cadence_and_add_tile_card_width_balance_reset_after_stage614.mjs scripts/playwright/stage616_post_stage615_home_board_column_cadence_and_add_tile_card_width_balance_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 615 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 615/616 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home surface kept the Stage 563 structure intact while widening the three-up board columns so the first row uses more of the canvas and the add-tile/card cadence reads closer to Recall.
- The live Stage 615 validation recorded `352px` add-tile width, `352px` representative card width, `8px` column gap, `110.81px` first-row right slack, preserved `203.52px` representative card height, `3` visible first-row tiles, `4` visible toolbar controls, and `0` visible day-group count nodes.
- Targeted frontend validation, live Windows Edge Stage 615 evidence, and the follow-up Stage 616 audit all passed.
