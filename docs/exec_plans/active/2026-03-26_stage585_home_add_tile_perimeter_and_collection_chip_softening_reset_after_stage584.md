# ExecPlan: Stage 585 Home Add-Tile Perimeter And Collection-Chip Softening Reset After Stage 584

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by making the `Add Content` tile perimeter quieter and demoting the lower collection chip under board cards.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The `Add Content` tile remains visible and first in the leading day group, but its perimeter reads quieter than the Stage 584 baseline.
- The lower collection chip remains visible and useful, but reads softer than the Stage 584 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage585_home_add_tile_perimeter_and_collection_chip_softening_reset_after_stage584.mjs scripts/playwright/stage586_post_stage585_home_add_tile_perimeter_and_collection_chip_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 585 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 585/586 touched set

## Outcome
- Complete locally on 2026-03-26.
- The `Add Content` tile kept the Stage 563 position and dashed perimeter, but the live Stage 585 validation reduced the visible perimeter to `rgba(138, 175, 235, 0.17)` with a calmer `rgba(10, 14, 21, 0.88)` background.
- The lower collection chip remained visible and useful, but the live Stage 585 validation reduced it to `7.52px` with `rgba(255, 255, 255, 0.008)` background, `rgba(255, 255, 255, 0.024)` border, and `rgba(202, 214, 235, 0.44)` text.
- Targeted frontend validation, live Windows Edge Stage 585 evidence, and the follow-up Stage 586 audit all passed.
