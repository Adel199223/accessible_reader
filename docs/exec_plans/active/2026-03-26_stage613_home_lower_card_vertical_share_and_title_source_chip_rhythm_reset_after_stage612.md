# ExecPlan: Stage 613 Home Lower-Card Vertical-Share And Title-Source-Chip Rhythm Reset After Stage 612

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by reclaiming a small amount of height from the poster-led preview and returning it to the lower title/source/chip seam.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No rail, toolbar, grouping, poster-content, or source-type treatment changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The representative card keeps the compact Stage 603/607 height band instead of regressing to a taller shell.
- The representative card preview consumes slightly less of the card than the Stage 612 baseline.
- The lower copy seam gains slightly more share than the Stage 612 baseline.
- Title/source/chip spacing opens modestly without undoing the Stage 611 legibility gains.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware poster treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage613_home_lower_card_vertical_share_and_title_source_chip_rhythm_reset_after_stage612.mjs scripts/playwright/stage614_post_stage613_home_lower_card_vertical_share_and_title_source_chip_rhythm_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 613 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 613/614 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home surface kept the Stage 563 structure intact while reallocating a little more card height into the lower title/source/chip seam without reopening toolbar, rail, or poster-content work.
- The live Stage 613 validation recorded a preserved `203.52px` representative card height, `0.6415` preview ratio, `0.2505` copy ratio, `16.008px` title line-height, `2.55px` title-to-source gap, `2.08px` source-to-chip gap, preserved `10.24px` source text at `rgba(196, 209, 231, 0.64)`, preserved `7.52px` collection-chip text at `rgba(207, 218, 237, 0.48)`, `4` visible toolbar controls, and `0` visible day-group count nodes.
- Targeted frontend validation, live Windows Edge Stage 613 evidence, and the follow-up Stage 614 audit all passed.
