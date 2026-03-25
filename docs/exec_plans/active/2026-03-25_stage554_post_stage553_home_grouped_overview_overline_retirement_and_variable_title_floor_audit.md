# ExecPlan: Stage 554 Post-Stage-553 Home Grouped-Overview Overline Retirement And Variable Title Floor Audit

## Summary
- Audit the Stage 553 wide-desktop `Home` grouped-overview row compression against Recall's current organizer-owned overview direction.
- Confirm that grouped-overview rows now read like denser source-list entries without the extra overline band or a forced two-line title floor.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview row internals at rest
  - primary-lane plus secondary-stack composition after the row-internal compression

## Acceptance
- The audit states clearly whether Stage 553 materially reduced the remaining grouped-overview row-height mismatch against the current Recall benchmark direction.
- The audit records whether grouped-overview rows no longer render the visible source-type overline and whether titles now collapse to their natural height when they do not need two lines.
- The audit records whether source-type context still holds without restoring extra row bands.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 553/554 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 553/554 files

## Outcome
- Completed.
- The Stage 554 audit confirmed that Stage 553 succeeded overall: wide-desktop `Home` now keeps grouped-overview rows without the visible source-type overline, keeps source-type context in the compact metadata line, and no longer reserves a fixed title `min-height` floor while preserving the Stage 551 attached footer and the Stage 537 primary-lane plus secondary-stack composition.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 553/554 harness pair
  - real Windows Edge Stage 554 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- The Stage 554 audit recorded `0` grouped-overview row overline nodes, a `36.94px` maximum grouped-overview row height, a `0px` maximum grouped-overview title `min-height`, a `13.3px` maximum first-row title height, a `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
