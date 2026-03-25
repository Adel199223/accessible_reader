# ExecPlan: Stage 558 Post-Stage-557 Home Grouped-Overview Visible View Count Retirement And Accessible Meta Preservation Audit

## Summary
- Audit the Stage 557 wide-desktop `Home` grouped-overview metadata-seam reset against Recall's current organizer-owned overview direction.
- Confirm that grouped-overview rows now avoid the visible `views` suffix while still preserving available-view-count context in accessible labeling.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview card-body metadata at rest
  - primary-lane plus secondary-stack composition after the visible metadata simplification

## Acceptance
- The audit states clearly whether Stage 557 materially reduced the remaining grouped-overview metadata-weight mismatch against the current Recall benchmark direction.
- The audit records whether grouped-overview `Captures`, `Web`, and `Documents` rows retired the visible `views` suffix while preserving timestamp and file-format context where needed.
- The audit records whether accessible row labeling still preserves view-count context after the visible metadata seam is shortened.
- The audit records whether the lighter metadata seam holds without regressing the Stage 553 row-height compression, the Stage 551 attached footer, or the Stage 537 primary-lane composition.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 557/558 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 557/558 files

## Outcome
- Completed.
- The Stage 558 audit confirmed that Stage 557 succeeded overall: wide-desktop `Home` now keeps grouped-overview `Captures` and `Web` rows with just the visible timestamp seam, keeps file-format plus timestamp context in `Documents`, and preserves available-view-count context in accessible row labels while holding the Stage 553 row-height compression, the Stage 551 attached footer, the Stage 555 lane-prefix retirement, and the Stage 537 primary-lane composition.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 557/558 harness pair
  - real Windows Edge Stage 558 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- The Stage 558 audit recorded `1` visible metadata part in grouped-overview `Captures` (`Mar 13`), `1` visible metadata part in grouped-overview `Web` (`Mar 14`), `2` visible metadata parts in grouped-overview `Documents` (`HTML · Mar 15`), preserved accessible row labels such as `Open Stage 10 Debug Article (Web), 2 views available`, a `35.3px` `Web` compact-meta width, a `75.19px` `Documents` compact-meta width, the preserved `36.94px` maximum grouped-overview row height, the preserved `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.
- The audit also refreshed `Graph` and original-only `Reader` at `http://127.0.0.1:8000`, with the Reader regression capture locked to an asserted `Original` tab selection.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
