# ExecPlan: Stage 595 Home Preview Badge Row And Utility Pill Border Softening Reset After Stage 594

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the preview badge row and softening visible utility-pill border emphasis.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Source-aware preview shells remain visible and useful, but the top-left preview badge row reads quieter than the Stage 594 baseline.
- The visible utility pills remain clear and clickable, but their border emphasis reads lighter than the Stage 594 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage595_home_preview_badge_row_and_utility_pill_border_softening_reset_after_stage594.mjs scripts/playwright/stage596_post_stage595_home_preview_badge_row_and_utility_pill_border_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 595 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 595/596 touched set

## Outcome
- Complete locally on 2026-03-26.
- The preview badge row kept the Stage 563 poster-led structure intact, but the live Stage 595 validation reduced it to `0.46` background alpha with `0.04` border alpha at `8.16px`.
- The visible Search, List, and Sort utility pills remained clear and clickable, but the live Stage 595 validation reduced their border emphasis to `0.05` alpha.
- Targeted frontend validation, live Windows Edge Stage 595 evidence, and the follow-up Stage 596 audit all passed.
