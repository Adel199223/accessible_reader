# ExecPlan: Stage 635 Home Lower-Card Title-Source-Chip Descent Finish And Copy-Seam Settling Reset After Stage 634

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by finishing one subtler lower-card title/source/chip descent pass and settling the lower copy seam a little further.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 633 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 633 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage635_home_lower_card_title_source_chip_descent_finish_and_copy_seam_settling_reset_after_stage634.mjs scripts/playwright/stage636_post_stage635_home_lower_card_title_source_chip_descent_finish_and_copy_seam_settling_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 635 run against the working WSL host `http://172.27.18.251:8002`
- targeted `git diff --check -- ...` over the Stage 635/636 touched set

## Outcome
- Complete locally after the live Stage 635/636 run against the repo-owned launcher path `http://127.0.0.1:8000`.
- The Stage 635 implementation kept the Stage 563 selected-collection rail plus day-grouped Home canvas intact while giving the lower title/source/chip descent one subtler finish pass and settling the copy seam a little further.
- A supporting live Edge sample recorded a `0.5937` preview ratio, a `0.2894` copy ratio, an `18.60px` title line-height, a `4.67px` title-to-source gap, a `3.95px` source-to-chip gap, `10.48px` source text at `0.72` alpha, a `7.79px` chip at `0.55` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` first day-group top offset plus `115.36px` first-row grid top offset.
