# ExecPlan: Stage 637 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Follow-Through Reset After Stage 636

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by carrying the lower-card copy seam and title/source/chip descent one subtler step past the Stage 635 finish state.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 635 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 635 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage637_home_lower_card_copy_seam_and_title_source_chip_descent_follow_through_reset_after_stage636.mjs scripts/playwright/stage638_post_stage637_home_lower_card_copy_seam_and_title_source_chip_descent_follow_through_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 637 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 637/638 touched set

## Outcome
- Complete locally after the live Stage 637/638 run against the repo-owned launcher path `http://127.0.0.1:8000`.
- The Stage 637 implementation kept the Stage 563 selected-collection rail plus day-grouped Home canvas intact while carrying the lower copy seam and title/source/chip descent one subtler step beyond the Stage 635 finish state.
- A supporting live Edge sample recorded a `0.5887` preview ratio, a `0.2935` copy ratio, an `18.87px` title line-height, a `4.86px` title-to-source gap, a `4.19px` source-to-chip gap, `10.50px` source text at `0.73` alpha, a `7.81px` chip at `0.56` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` first day-group top offset plus `115.36px` first-row grid top offset.
