# ExecPlan: Stage 563 Home Structural Recall Parity Reset After Stage 562

## Summary
- Reset the wide-desktop `Home` default away from the grouped-overview workspace and toward the Recall-style homepage structure shown in this thread.
- Make the default `Home` surface a selected-collection, recency-first canvas with day-grouped cards and a first-group `Add Content` tile.
- Keep the current advanced organizer capabilities available, but demote them out of the first-screen chrome.

## Scope
- Wide-desktop `Home` only.
- Touched areas:
  - Home shell mode and top-bar treatment
  - Home collection rail structure and default selection model
  - Home date-grouped card canvas and card/list controls
  - Home advanced controls demotion
  - Stage 37 component assertions
  - Stage 563/564 Edge validation harnesses
- Explicitly out of scope:
  - backend or storage schema changes
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind
  - `Notes`
  - `Study`

## Acceptance
- Default wide-desktop `Home` no longer opens into the current grouped-overview source-bucket board.
- The left side behaves like a simpler collection rail that selects one working collection at a time.
- The main canvas groups matching sources by day using `updated_at`, newest first.
- The first visible day group includes an `Add Content` tile.
- Visible first-screen Home controls are limited to `Search`, `Add`, `List`, and `Sort`.
- Advanced Home capabilities remain available without dominating the default first-screen hierarchy.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 563/564 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 563 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 563/564 files

## Outcome
- Complete.
- Wide-desktop `Home` now uses a Home-specific shell mode with a selected-collection rail, a date-grouped card canvas, a first-group `Add Content` tile, and a compact top-right `Search` / `Add` / `List` / `Sort` control cluster instead of the old grouped-overview default.
- Advanced organizer controls remain available, but they now sit behind `Organizer options` or secondary interactions instead of dominating the first-screen Home chrome.
- Live Stage 563 Edge validation recorded `Captures` as the default active rail and canvas heading, `3` visible collection rail sections, a `268px` rail width, a `1215.53px` canvas width, a `106.66px` first-day-group top offset, and a `306.98px` `Add Content` tile height.

## Next
- Stage 564 is complete, so roadmap and handoff docs should now treat Stage 564 as the current Home audit checkpoint and treat the Stage 537-562 grouped-overview ladder as a legacy baseline rather than the active Home target.
