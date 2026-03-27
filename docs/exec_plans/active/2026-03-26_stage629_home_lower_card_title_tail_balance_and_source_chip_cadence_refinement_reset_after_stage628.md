# ExecPlan: Stage 629 Home Lower-Card Title-Tail Balance And Source-Chip Cadence Refinement Reset After Stage 628

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title tail a slightly more even finish and the source/chip cadence one subtler refinement pass.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 627 baseline while lower-copy share rises above it.
- Title/source/chip spacing improves again without regressing the Stage 627 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage629_home_lower_card_title_tail_balance_and_source_chip_cadence_refinement_reset_after_stage628.mjs scripts/playwright/stage630_post_stage629_home_lower_card_title_tail_balance_and_source_chip_cadence_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 629 run against the working WSL host `http://172.27.18.251:8002`
- targeted `git diff --check -- ...` over the Stage 629/630 touched set

## Outcome
- Complete and validated locally.
- Stage 629 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while giving the lower title tail a more even finish and the source/chip cadence one subtler refinement pass without reopening shell, rail, toolbar, or board-width work.
- The implementation validation recorded a `0.6091` preview ratio, a `0.2773` copy ratio, a `17.74px` title line-height, a `4.03px` title-to-source gap, a `3.31px` source-to-chip gap, `10.43px` source text at `0.69` alpha, a `7.73px` chip at `0.52` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
