# ExecPlan: Stage 639 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Finish Reset After Stage 638

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by finishing one subtler lower-card copy-seam and title/source/chip descent step past the Stage 637 follow-through state.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No shell, rail, toolbar, board-width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 637 baseline while lower-copy share rises above it.
- Title/source/chip spacing and descent improve again without regressing the Stage 637 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage639_home_lower_card_copy_seam_and_title_source_chip_descent_finish_reset_after_stage638.mjs scripts/playwright/stage640_post_stage639_home_lower_card_copy_seam_and_title_source_chip_descent_finish_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 639 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 639/640 touched set

## Outcome
- Complete locally after the Stage 639 implementation pass and Stage 640 audit.
- The pass kept the Stage 563 selected-collection rail plus day-grouped Home canvas intact and finished one subtler lower-card copy-seam and title/source/chip descent step past the Stage 637 follow-through state without reopening shell, rail, toolbar, board-width, or add-tile work.
- A supporting live Edge sample recorded a `0.5838` preview ratio, a `0.2974` copy ratio, a `19.15px` title line-height, a `5.08px` title-to-source gap, a `4.41px` source-to-chip gap, `10.51px` source text at `0.74` alpha, a `7.82px` chip at `0.57` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, and preserved the Stage 617 `90.98px` first day-group top offset plus `115.36px` first-row grid top offset.
- `Graph` and original-only `Reader` remained the regression surfaces for the subsequent Stage 640 audit.
