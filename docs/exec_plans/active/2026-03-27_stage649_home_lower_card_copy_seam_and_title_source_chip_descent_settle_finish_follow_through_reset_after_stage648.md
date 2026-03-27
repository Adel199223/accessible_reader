# ExecPlan: Stage 649 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Settle Finish Follow-Through Reset After Stage 648

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by carrying one subtler lower-card copy-seam and title/source/chip settle finish follow-through step beyond the Stage 647 follow-through baseline.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 647 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 647 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage649_home_lower_card_copy_seam_and_title_source_chip_descent_settle_finish_follow_through_reset_after_stage648.mjs scripts/playwright/stage650_post_stage649_home_lower_card_copy_seam_and_title_source_chip_descent_settle_finish_follow_through_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 649 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 649/650 touched set

## Outcome
- Complete locally after the Stage 649 implementation pass and Stage 650 audit.
- The pass keeps the Stage 563 selected-collection rail plus day-grouped Home canvas intact and carries one subtler lower-card copy-seam and title/source/chip settle finish follow-through step beyond the Stage 647 follow-through baseline without reopening shell, rail, toolbar, board-width, or add-tile work.
- Live Edge evidence recorded a `0.5585` preview ratio, a `0.3183` copy ratio, a `20.62px` title line-height, a `6.17px` title-to-source gap, a `5.50px` source-to-chip gap, `10.608px` source text at `0.79` alpha, a `7.92px` chip at `0.62` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 650 audit.
