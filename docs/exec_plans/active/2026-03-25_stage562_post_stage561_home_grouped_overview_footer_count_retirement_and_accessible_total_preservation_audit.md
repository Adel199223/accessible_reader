# ExecPlan: Stage 562 Post-Stage-561 Home Grouped-Overview Footer Count Retirement And Accessible Total Preservation Audit

## Summary
- Audit the Stage 561 wide-desktop `Home` grouped-overview footer-label reset against Recall's current organizer-owned overview direction.
- Confirm that the grouped-overview continuation footer now avoids the visible source total while still preserving that total in accessibility.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview footer/button at rest
  - primary-lane plus secondary-stack composition after the visible footer-count retirement

## Acceptance
- The audit states clearly whether Stage 561 materially reduced the remaining grouped-overview footer utility-weight mismatch against the current Recall benchmark direction.
- The audit records whether the grouped-overview `Captures` continuation footer retired the visible source total.
- The audit records whether grouped-overview footer accessibility still preserves source-total context after the visible count retires.
- The audit records whether the quieter footer label holds without regressing the Stage 551 attached-footer treatment, the Stage 557 row-metadata simplification, the Stage 559 hidden header-count chip, or the Stage 537 primary-lane composition.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 561/562 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 561/562 files

## Outcome
- Completed.
- The Stage 562 audit confirmed that Stage 561 succeeded overall: wide-desktop `Home` now keeps the grouped-overview continuation footer free of the visible source total, preserves that total in hidden accessible footer text, and holds the Stage 551 attached-footer treatment, the Stage 557 row-metadata simplification, the Stage 559 hidden header-count chip, and the Stage 537 primary-lane composition.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 561/562 harness pair
  - real Windows Edge Stage 562 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- The Stage 562 audit recorded the grouped-overview footer button text `Show all captures, 30 total sources`, the visible footer label `Show all captures`, the hidden footer total `, 30 total sources`, collapsed that hidden footer total to `1px` by `1px`, held the `13.11px` `Captures` footer button height, preserved the `36.94px` maximum grouped-overview row height, preserved the `247.44px` primary-width delta, preserved the `51.06px` grouped-overview grid offset, and preserved the `47.83px` overview header height.
- The audit also refreshed `Graph` and original-only `Reader` at `http://127.0.0.1:8000`, with the Reader regression capture locked to an asserted `Original` tab selection.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
