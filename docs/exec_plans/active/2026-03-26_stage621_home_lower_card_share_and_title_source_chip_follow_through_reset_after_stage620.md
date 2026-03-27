# ExecPlan: Stage 621 Home Lower-Card Share And Title-Source-Chip Follow-Through Reset After Stage 620

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by giving the lower title/source/chip seam slightly more ownership inside each card.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No rail hierarchy, organizer copy, toolbar layout, board column width, or add-tile composition changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- Preview share drops below the Stage 614 baseline while lower-copy share rises above it.
- Title/source/chip spacing improves without regressing the Stage 611 source and chip legibility band.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage621_home_lower_card_share_and_title_source_chip_follow_through_reset_after_stage620.mjs scripts/playwright/stage622_post_stage621_home_lower_card_share_and_title_source_chip_follow_through_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 621 run against the working WSL host if localhost forwarding is unavailable
- targeted `git diff --check -- ...` over the Stage 621/622 touched set

## Outcome
- Complete and validated locally.
- Stage 621 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while shifting a little more ownership from the poster to the lower title/source/chip seam without reopening rail, toolbar, or board-column work.
- The implementation validation recorded a `0.6335` preview ratio, a `0.2569` copy ratio, a `16.47px` title line-height, a `2.88px` title-to-source gap, a `2.23px` source-to-chip gap, preserved `352px` representative card width, preserved `203.52px` representative card height, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
