# ExecPlan: Stage 571 Home Rail-Header Restraint And Board-Card Meta Flattening Reset After Stage 570

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the rail header and active child row while flattening the lower board-card seam.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The rail header reads lighter and the active preview row reads like child continuation instead of a mini card.
- Board cards no longer repeat a visible per-card date because the canvas is already grouped by day.
- `web`, `paste`, and file/document posters keep source-aware fallback treatment while the lower body reads flatter and quieter.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage571_home_rail_header_restraint_and_board_card_meta_flattening_reset_after_stage570.mjs scripts/playwright/stage572_post_stage571_home_rail_header_restraint_and_board_card_meta_flattening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 571 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 571/572 touched set

## Outcome
- Complete.
- The Home rail header now reads calmer at rest, the active child continuation row now reads more like a small nested tree item, and the board-card body no longer repeats the day-group date inside each card.
- Board cards now flatten their lower seam around title, source row, and quieter collection chip, which pulls the stage closer to Recall’s grouped-by-day canvas rhythm.
- Live Stage 571 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `3 groups` as the restrained rail heading meta, `34 sources in Captures` as the quieter rail summary line, a `16.61px` active continuation-row height with one visible preview marker, `0` visible board-card date nodes, an `18.88px` chip height, a `225.59px` add-tile height, a `94.28px` first day-group top offset, and preserved source-aware `paste`, `web`, and file/document cards.
