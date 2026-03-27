# ExecPlan: Stage 641 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Settle Reset After Stage 640

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by settling one final subtler lower-card copy-seam and title/source/chip descent step past the Stage 639 finish state.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 639 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 639 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage641_home_lower_card_copy_seam_and_title_source_chip_descent_settle_reset_after_stage640.mjs scripts/playwright/stage642_post_stage641_home_lower_card_copy_seam_and_title_source_chip_descent_settle_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 641 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 641/642 touched set

## Outcome
- Complete locally after the Stage 641 implementation pass and Stage 642 audit.
- The pass kept the Stage 563 selected-collection rail plus day-grouped Home canvas intact and settled one final subtler lower-card copy-seam and title/source/chip descent step past the Stage 639 finish state without reopening shell, rail, toolbar, board-width, or add-tile work.
- A supporting live Edge sample recorded a `0.5787` preview ratio, a `0.3016` copy ratio, a `19.42px` title line-height, a `5.30px` title-to-source gap, a `4.63px` source-to-chip gap, `10.53px` source text at `0.75` alpha, a `7.84px` chip at `0.58` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` first day-group top offset plus `115.36px` first-row grid top offset.
- `Graph` and original-only `Reader` remained the regression surfaces for the subsequent Stage 642 audit.
