# ExecPlan: Stage 623 Home Lower-Card Seam Continuation And Copy-Stack Cadence Reset After Stage 622

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title/source/chip seam one subtler follow-through pass.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 621 baseline while lower-copy share rises above it.
- Title/source/chip spacing improves again without regressing the Stage 621 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage623_home_lower_card_seam_continuation_and_copy_stack_cadence_reset_after_stage622.mjs scripts/playwright/stage624_post_stage623_home_lower_card_seam_continuation_and_copy_stack_cadence_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 623 run against the working WSL host if localhost forwarding is unavailable
- targeted `git diff --check -- ...` over the Stage 623/624 touched set

## Outcome
- Complete and validated locally.
- Stage 623 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while giving the lower title/source/chip seam one subtler follow-through pass without reopening shell, rail, toolbar, or board-width work.
- The implementation validation recorded a `0.6271` preview ratio, a `0.2625` copy ratio, a `16.78px` title line-height, a `3.27px` title-to-source gap, a `2.47px` source-to-chip gap, `10.37px` source text at `0.67` alpha, a `7.65px` chip at `0.5` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
