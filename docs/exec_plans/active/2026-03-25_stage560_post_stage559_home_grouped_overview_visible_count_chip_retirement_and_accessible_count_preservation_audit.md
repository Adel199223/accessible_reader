# ExecPlan: Stage 560 Post-Stage-559 Home Grouped-Overview Visible Count Chip Retirement And Accessible Count Preservation Audit

## Summary
- Audit the Stage 559 wide-desktop `Home` grouped-overview count-chip reset against Recall's current organizer-owned overview direction.
- Confirm that grouped-overview card headers now avoid the visible source-count chip while still preserving section count context in accessibility.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview card headings at rest
  - primary-lane plus secondary-stack composition after the visible count-chip retirement

## Acceptance
- The audit states clearly whether Stage 559 materially reduced the remaining grouped-overview card-heading metadata mismatch against the current Recall benchmark direction.
- The audit records whether grouped-overview `Captures`, `Web`, and `Documents` cards retired the visible source-count chip.
- The audit records whether grouped-overview section accessibility still preserves source-count context after the visible chip retires.
- The audit records whether the quieter card-heading seam holds without regressing the Stage 549 earlier board start, the Stage 551 attached footer, the Stage 553 row-height compression, the Stage 557 row-metadata simplification, or the Stage 537 primary-lane composition.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 559/560 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 559/560 files

## Outcome
- Completed.
- The Stage 560 audit confirmed that Stage 559 succeeded overall: wide-desktop `Home` now keeps grouped-overview card headings free of the visible per-card source-count chip, preserves source-count context in accessible card naming, and holds the Stage 549 earlier board start, the Stage 551 attached footer, the Stage 553 row-height compression, the Stage 557 row-metadata simplification, and the Stage 537 primary-lane composition.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 559/560 harness pair
  - real Windows Edge Stage 560 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- The Stage 560 audit recorded accessible grouped-overview card names `Captures, 30 sources`, `Web, 2 sources`, and `Documents, 2 sources`, collapsed each count chip to `1px` by `1px`, preserved `Mar 13`, `Mar 14`, and `HTML · Mar 15` row metadata, held the `36.94px` maximum grouped-overview row height, held the `13.11px` `Captures` footer button height, preserved the `247.44px` primary-width delta, preserved the `51.06px` grouped-overview grid offset, and preserved the `47.83px` overview header height.
- The audit also refreshed `Graph` and original-only `Reader` at `http://127.0.0.1:8000`, with the Reader regression capture locked to an asserted `Original` tab selection.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
