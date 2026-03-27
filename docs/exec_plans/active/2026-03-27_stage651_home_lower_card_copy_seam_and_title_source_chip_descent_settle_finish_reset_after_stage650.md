# ExecPlan: Stage 651 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Settle Finish Reset After Stage 650

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by carrying one final subtler lower-card copy-seam and title/source/chip descent settle finish step beyond the Stage 649 finish-follow-through baseline.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 649 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 649 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage651_home_lower_card_copy_seam_and_title_source_chip_descent_settle_finish_reset_after_stage650.mjs scripts/playwright/stage652_post_stage651_home_lower_card_copy_seam_and_title_source_chip_descent_settle_finish_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 651 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 651/652 touched set

## Outcome
- Complete locally after the Stage 651 implementation pass and Stage 652 audit.
- The pass keeps the Stage 563 selected-collection rail plus day-grouped Home canvas intact and carries one final subtler lower-card copy-seam and title/source/chip descent settle finish step beyond the Stage 649 finish-follow-through baseline without reopening shell, rail, toolbar, board-width, or add-tile work.
- Live Edge evidence recorded a `0.5536` preview ratio, a `0.3224` copy ratio, a `20.99px` title line-height, a `6.39px` title-to-source gap, a `5.72px` source-to-chip gap, `10.64px` source text at `0.8` alpha, a `7.952px` chip at `0.63` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 652 audit.
