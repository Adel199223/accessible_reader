# ExecPlan: Stage 633 Home Lower-Card Title-Source-Chip Descent Follow-Through Reset After Stage 632

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title/source/chip descent one subtler follow-through pass.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 631 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 631 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage633_home_lower_card_title_source_chip_descent_follow_through_reset_after_stage632.mjs scripts/playwright/stage634_post_stage633_home_lower_card_title_source_chip_descent_follow_through_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 633 run against the working WSL host `http://172.27.18.251:8002`
- targeted `git diff --check -- ...` over the Stage 633/634 touched set

## Outcome
- Complete locally after the live Stage 633/634 run against `http://172.27.18.251:8002`.
- The Stage 633 implementation kept the Stage 563 selected-collection rail plus day-grouped Home canvas intact while giving the lower title/source/chip descent one subtler follow-through pass.
- A supporting live Edge sample recorded a `0.5989` preview ratio, a `0.2853` copy ratio, an `18.30px` title line-height, a `4.44px` title-to-source gap, a `3.73px` source-to-chip gap, `10.46px` source text at `0.71` alpha, a `7.78px` chip at `0.54` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` first day-group top offset plus `115.36px` first-row grid top offset.
