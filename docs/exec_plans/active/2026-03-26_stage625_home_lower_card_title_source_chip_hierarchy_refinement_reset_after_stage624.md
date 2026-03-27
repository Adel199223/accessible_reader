# ExecPlan: Stage 625 Home Lower-Card Title-Source-Chip Hierarchy Refinement Reset After Stage 624

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title/source/chip seam one subtler hierarchy refinement pass.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 623 baseline while lower-copy share rises above it.
- Title/source/chip spacing improves again without regressing the Stage 623 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage625_home_lower_card_title_source_chip_hierarchy_refinement_reset_after_stage624.mjs scripts/playwright/stage626_post_stage625_home_lower_card_title_source_chip_hierarchy_refinement_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 625 run against the working WSL host if localhost forwarding is unavailable
- targeted `git diff --check -- ...` over the Stage 625/626 touched set

## Outcome
- Complete and validated locally.
- Stage 625 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while giving the lower title/source/chip seam one subtler hierarchy refinement pass without reopening shell, rail, toolbar, or board-width work.
- The implementation validation recorded a `0.6211` preview ratio, a `0.2676` copy ratio, a `17.1px` title line-height, a `3.59px` title-to-source gap, a `2.72px` source-to-chip gap, `10.4px` source text at `0.67` alpha, a `7.66px` chip at `0.5` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
