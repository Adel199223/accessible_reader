# ExecPlan: Stage 617 Home Upper-Board Whitespace Compaction And Earlier First-Row Start Reset After Stage 616

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by trimming upper-board whitespace so the first day label and first card row start earlier at wide desktop scale.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No card-width, poster-content, toolbar-ownership, rail-structure, or lower-card typography changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The canvas top padding and toolbar-to-first-day seam both reduce below the Stage 616 baseline.
- The first day-group heading and first grid row start materially earlier inside the canvas than they did in Stage 616.
- The Stage 615 board-column cadence and card-width band stay intact.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware poster treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage617_home_upper_board_whitespace_compaction_and_earlier_first_row_start_reset_after_stage616.mjs scripts/playwright/stage618_post_stage617_home_upper_board_whitespace_compaction_and_earlier_first_row_start_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 617 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 617/618 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home surface kept the Stage 563 structure intact while trimming the canvas top pad, toolbar stack seam, and first day-group seam so the board begins earlier inside the canvas.
- The live Stage 617 validation recorded `6.4px` canvas top padding, `6.4px` canvas gap, a `90.98px` first day-group heading top offset, a `115.36px` first-row grid top offset, `6.39px` toolbar-to-heading and heading-to-grid seams, preserved `352px` add-tile/card widths, preserved `203.52px` representative card height, `3` visible first-row tiles, `4` visible toolbar controls, and `0` visible day-group count nodes.
- Targeted frontend validation, live Windows Edge Stage 617 evidence, and the follow-up Stage 618 audit all passed.
