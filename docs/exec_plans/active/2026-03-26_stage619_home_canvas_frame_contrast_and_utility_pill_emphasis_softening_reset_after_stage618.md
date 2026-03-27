# ExecPlan: Stage 619 Home Canvas-Frame Contrast And Utility-Pill Emphasis Softening Reset After Stage 618

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by softening the canvas frame and calming Search/List/Sort pill emphasis.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No board-start spacing, card-width cadence, rail structure, or lower-card rhythm changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The canvas background/border contrast reduces below the Stage 618 baseline.
- Search/List/Sort fill and border emphasis reduce below the Stage 618 baseline.
- The Stage 617 upper-board whitespace band and the Stage 615 card-width cadence stay intact.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware poster treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage619_home_canvas_frame_contrast_and_utility_pill_emphasis_softening_reset_after_stage618.mjs scripts/playwright/stage620_post_stage619_home_canvas_frame_contrast_and_utility_pill_emphasis_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 619 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 619/620 touched set

## Outcome
- Complete and validated locally.
- Stage 619 kept the Stage 563 selected-collection rail plus day-grouped canvas intact while softening the remaining canvas-frame and utility-pill contrast without reopening board-start spacing, card-width cadence, or lower-card rhythm.
- The implementation validation recorded `0.82` canvas background alpha, `0.024` canvas border alpha, `0.02` Search fill alpha, `0.035` Search border alpha, `0.01` List/Sort fill alpha, `0.03` List/Sort border alpha, preserved `352px` add-tile/card widths, preserved `203.52px` representative card height, `4` visible toolbar controls, and `0` visible day-group count nodes in real Windows Edge.
