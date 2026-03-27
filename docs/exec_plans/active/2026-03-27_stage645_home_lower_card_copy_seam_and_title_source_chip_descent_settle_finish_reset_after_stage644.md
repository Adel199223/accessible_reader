# ExecPlan: Stage 645 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Settle Finish Reset After Stage 644

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by carrying one final subtler lower-card copy-seam and title/source/chip settle finish step past the Stage 643 follow-through state.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 643 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 643 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage645_home_lower_card_copy_seam_and_title_source_chip_descent_settle_finish_reset_after_stage644.mjs scripts/playwright/stage646_post_stage645_home_lower_card_copy_seam_and_title_source_chip_descent_settle_finish_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 645 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 645/646 touched set

## Outcome
- Complete locally after the Stage 645 implementation pass and Stage 646 audit.
- The pass keeps the Stage 563 selected-collection rail plus day-grouped Home canvas intact and carries one final subtler lower-card copy-seam and title/source/chip settle finish step past the Stage 643 follow-through state without reopening shell, rail, toolbar, board-width, or add-tile work.
- Live Edge evidence recorded a `0.5686` preview ratio, a `0.3098` copy ratio, a `19.98px` title line-height, a `5.75px` title-to-source gap, a `5.08px` source-to-chip gap, `10.56px` source text at `0.77` alpha, a `7.87px` chip at `0.60` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 646 audit.
