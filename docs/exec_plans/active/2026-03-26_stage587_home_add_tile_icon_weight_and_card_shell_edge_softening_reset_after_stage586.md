# ExecPlan: Stage 587 Home Add-Tile Icon Weight And Card Shell Edge Softening Reset After Stage 586

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the `Add Content` plus-mark weight and softening the outer board-card shell edge.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The `Add Content` tile remains visible and first in the leading day group, but the plus-mark circle and glyph read calmer than the Stage 586 baseline.
- Board cards remain poster-led and source-aware, but the outer shell edge reads softer than the Stage 586 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage587_home_add_tile_icon_weight_and_card_shell_edge_softening_reset_after_stage586.mjs scripts/playwright/stage588_post_stage587_home_add_tile_icon_weight_and_card_shell_edge_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 587 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 587/588 touched set

## Outcome
- Complete locally on 2026-03-26.
- The `Add Content` tile kept the Stage 563 position and label, but the live Stage 587 validation reduced the plus-mark circle to `44.47px` square with `33.92px` icon size, `500` font weight, and `rgba(163, 196, 255, 0.9)` text.
- The outer board-card shell remained poster-led and source-aware, but the live Stage 587 validation reduced the shell edge to `rgba(255, 255, 255, 0.043)` with a `15px` radius and `rgba(11, 16, 24, 0.96)` background.
- Targeted frontend validation, live Windows Edge Stage 587 evidence, and the follow-up Stage 588 audit all passed.
