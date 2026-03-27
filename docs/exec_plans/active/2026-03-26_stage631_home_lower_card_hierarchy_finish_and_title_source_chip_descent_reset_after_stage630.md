# ExecPlan: Stage 631 Home Lower-Card Hierarchy Finish And Title-Source-Chip Descent Reset After Stage 630

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title/source/chip seam one subtler hierarchy-finish pass and a calmer descending cadence.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 629 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 629 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage631_home_lower_card_hierarchy_finish_and_title_source_chip_descent_reset_after_stage630.mjs scripts/playwright/stage632_post_stage631_home_lower_card_hierarchy_finish_and_title_source_chip_descent_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 631 run against the working WSL host `http://172.27.18.251:8002`
- targeted `git diff --check -- ...` over the Stage 631/632 touched set

## Outcome
- Complete and validated locally.
- Stage 631 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while giving the lower title/source/chip seam one subtler hierarchy-finish pass and a calmer descending cadence without reopening shell, rail, toolbar, or board-width work.
- The implementation validation recorded a `0.6041` preview ratio, a `0.2812` copy ratio, an `18.03px` title line-height, a `4.22px` title-to-source gap, a `3.52px` source-to-chip gap, `10.45px` source text at `0.7` alpha, a `7.76px` chip at `0.53` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
