# ExecPlan: Stage 573 Home Preview-Led Card Proportion And Quieter Selected-Row Support Reset After Stage 572

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by quieting the active selected-row support seam and letting the poster own more of each board card.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The active selected rail row now uses shorter support copy instead of the heavier descriptive sentence.
- Board cards stay source-aware, but the preview becomes more dominant than the lower title/source/chip seam.
- Visible board-card date nodes stay retired because the canvas is already grouped by day.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage573_home_preview_led_card_proportion_and_quieter_selected_row_support_reset_after_stage572.mjs scripts/playwright/stage574_post_stage573_home_preview_led_card_proportion_and_quieter_selected_row_support_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 573 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 573/574 touched set

## Outcome
- Complete.
- The selected rail row now uses shorter support copy such as `Local captures`, which makes the row behave more like a compact selected collection rather than a descriptive panel.
- Board cards now let the poster carry more of the visible hierarchy while keeping the lower seam present but quieter.
- Live Stage 573 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text with a compact `14`-character length, a `215.19px` add-tile height, `0` visible board-card date nodes, a `0.64` preview-to-card height ratio for the representative `paste` card, and preserved source-aware `paste`, `web`, and file/document cards.
