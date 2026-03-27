# ExecPlan: Stage 611 Home Lower-Card Source-Row And Collection-Chip Cadence Rebalance Reset After Stage 610

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by making the lower card source row and collection chip slightly more legible without reopening layout, poster media, or toolbar work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No toolbar, rail, grouping, poster, or day-group layout changes.
- No card-title, add-tile, or preview-shell changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The lower card source row stays quiet, but reads slightly more clearly than the Stage 610 baseline.
- The lower collection chip stays attached and restrained, but reads slightly more clearly than the Stage 610 baseline.
- Representative card height stays in the compact Stage 603/607 cadence band instead of regressing toward an earlier taller card shell.
- The Stage 610 toolbar/rail-copy restraint stays intact.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware card treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage611_home_lower_card_source_row_and_collection_chip_cadence_rebalance_reset_after_stage610.mjs scripts/playwright/stage612_post_stage611_home_lower_card_source_row_and_collection_chip_cadence_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 611 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 611/612 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home surface kept the Stage 563 structure intact, but the live Stage 611 validation made the lower source row and collection chip slightly more legible without reopening toolbar, rail, or poster work.
- The representative card kept a compact lower seam while the live Stage 611 validation raised source-row and chip legibility above the Stage 610 baseline and preserved `4` visible toolbar controls plus `0` visible day-group count nodes.
- Targeted frontend validation, live Windows Edge Stage 611 evidence, and the follow-up Stage 612 audit all passed.
