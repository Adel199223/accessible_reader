# ExecPlan: Stage 627 Home Lower-Card Title-Wrap And Source-Chip Handoff Refinement Reset After Stage 626

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title line a calmer wrap and the source/chip handoff one subtler refinement pass.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 625 baseline while lower-copy share rises above it.
- Title-wrap and source/chip spacing improve again without regressing the Stage 625 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage627_home_lower_card_title_wrap_and_source_chip_handoff_refinement_reset_after_stage626.mjs scripts/playwright/stage628_post_stage627_home_lower_card_title_wrap_and_source_chip_handoff_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 627 run against the working WSL host if localhost forwarding is unavailable
- targeted `git diff --check -- ...` over the Stage 627/628 touched set

## Outcome
- Complete and validated locally.
- Stage 627 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while giving the title line a calmer wrap and the source/chip handoff one subtler refinement pass without reopening shell, rail, toolbar, or board-width work.
- The implementation validation recorded a `0.6149` preview ratio, a `0.2726` copy ratio, a `17.46px` title line-height, a `3.8px` title-to-source gap, a `3.03px` source-to-chip gap, `10.42px` source text at `0.68` alpha, a `7.7px` chip at `0.51` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
