# ExecPlan: Stage 599 Home Rail Tree Simplification And Board Continuation Demotion Reset After Stage 598

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by flattening the active rail tree row, thinning the attached child-preview seam, and demoting the board footer continuation copy.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The active collection row reads more like a selected tree row than a mini card.
- The attached active child preview stays present, but it reads as a thinner continuation seam than the earlier baseline.
- The visible footer continuation copy drops the numeric total while the accessible name still preserves the total count.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage599_home_rail_tree_simplification_and_board_continuation_demotion_reset_after_stage598.mjs scripts/playwright/stage600_post_stage599_home_rail_tree_simplification_and_board_continuation_demotion_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 599 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 599/600 touched set

## Outcome
- Complete locally on 2026-03-26.
- The active rail selection kept the Stage 563 poster-led Home structure intact, but the live Stage 599 validation reduced the selected-row chrome to `0.66` background alpha, `0.05` border alpha, and `0.01` inset-glow alpha with a `10px` radius and a `44.61px` button height.
- The attached child-preview seam stayed present under the selected collection, but the live Stage 599 validation reduced it to a `13.58px` seam height, `8.96px` type, `0.42` text alpha, `0.24` mark alpha, and a `3.19px` mark size.
- The board continuation stayed functional, but the live Stage 599 validation demoted the visible copy to `Show all captures` while preserving the accessible-only total as `, 34 total sources`.
- Targeted frontend validation, live Windows Edge Stage 599 evidence, and the follow-up Stage 600 audit all passed.
