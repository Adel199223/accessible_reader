# ExecPlan: Stage 556 Post-Stage-555 Home Grouped-Overview Redundant Lane Prefix Retirement And Lighter Row Meta Audit

## Summary
- Audit the Stage 555 wide-desktop `Home` grouped-overview metadata-seam reset against Recall's current organizer-owned overview direction.
- Confirm that grouped-overview rows now avoid redundant lane-prefix repetition in `Captures` and `Web` while keeping useful format context in `Documents`.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview card-body metadata at rest
  - primary-lane plus secondary-stack composition after the metadata-seam simplification

## Acceptance
- The audit states clearly whether Stage 555 materially reduced the remaining grouped-overview metadata-weight mismatch against the current Recall benchmark direction.
- The audit records whether `Captures` and `Web` rows retired redundant visible lane prefixes while `Documents` rows still preserve format-specific context.
- The audit records whether the lighter metadata seam holds without regressing the Stage 553 row-height compression, the Stage 551 attached footer, or the Stage 537 primary-lane composition.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 555/556 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 555/556 files

## Outcome
- Completed.
- The Stage 556 audit confirmed that Stage 555 succeeded overall: wide-desktop `Home` now keeps grouped-overview `Captures` and `Web` rows without redundant visible lane prefixes, keeps format-specific context in `Documents`, and preserves the Stage 553 row-height compression, the Stage 551 attached footer, and the Stage 537 primary-lane composition.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 555/556 harness pair
  - real Windows Edge Stage 556 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- The Stage 556 audit recorded `2` visible metadata parts in grouped-overview `Captures` (`Mar 13 · 2 views`), `2` visible metadata parts in grouped-overview `Web` (`Mar 14 · 2 views`), `3` visible metadata parts in grouped-overview `Documents` (`HTML · Mar 15 · 2 views`), an `83.73px` maximum `Web` compact-meta width, a `124.11px` `Documents` compact-meta width, the preserved `36.94px` maximum grouped-overview row height, the preserved `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.
- The audit also refreshed `Graph` and original-only `Reader` at `http://127.0.0.1:8000`, with the Reader regression capture locked to an asserted `Original` tab selection.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
