# ExecPlan: Stage 607 Home Card-Identity Seam Rebalance Reset After Stage 606

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by making the lower title, source row, and collection chip slightly more legible beneath the poster.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No toolbar, rail, grouping, or organizer-behavior changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Representative board cards keep the Stage 603/605 density win instead of reopening taller shells.
- The title, source row, and collection chip remain visible and land slightly stronger than the Stage 604 baseline without climbing back to the Stage 602 pre-compression weight.
- The Stage 605 poster-label and grid-whitespace calibration remains intact.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware card treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage607_home_card_identity_seam_rebalance_reset_after_stage606.mjs scripts/playwright/stage608_post_stage607_home_card_identity_seam_rebalance_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 607 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 607/608 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home board kept the Stage 563 selected-collection rail and day-grouped canvas intact, but the live Stage 607 validation made the lower identity seam more readable again without reopening the Stage 603 shell height or the Stage 605 spacing work.
- The representative lower seam stayed restrained while the live Stage 607 validation moved the title, source row, and collection chip into the middle ground between the Stage 604 calm baseline and the Stage 602 pre-compression ceiling.
- Targeted frontend validation, live Windows Edge Stage 607 evidence, and the follow-up Stage 608 audit all passed.
