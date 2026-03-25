# ExecPlan: Stage 550 Post-Stage-549 Home Grouped-Overview Card Intro-Copy Retirement And Earlier Row-Start Audit

## Summary
- Audit the Stage 549 wide-desktop `Home` grouped-overview card intro-copy retirement against Recall's current organizer-owned overview direction.
- Confirm that grouped-overview cards now start their source rows earlier without the old visible intro-copy band.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview card tops at rest
  - primary-lane plus secondary-stack composition after the card-header simplification

## Acceptance
- The audit states clearly whether Stage 549 materially reduced the remaining grouped-overview card intro-copy mismatch against the current Recall benchmark direction.
- The audit records whether the grouped-overview cards now begin their first visible source rows earlier without the old explanatory band.
- The audit records whether the card-header simplification improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 549/550 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 549/550 files

## Outcome
- Completed.
- The Stage 550 audit confirmed that Stage 549 succeeded overall: wide-desktop `Home` now keeps leaner grouped-overview card tops with no visible intro-copy band inside `Captures`, `Web`, or `Documents`, and the first source rows begin materially earlier.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 549/550 harness pair
  - real Windows Edge Stage 550 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - targeted `git diff --check -- ...` over the touched Stage 549/550 files
- The Stage 550 audit recorded `0` grouped-overview card header paragraphs, a `14.5px` maximum card header height, a `21.61px` maximum first-row offset, a `1.95px` maximum header-to-row gap, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.
- The audit also refreshed `Graph` and original-only `Reader` at `http://127.0.0.1:8000`, with the Reader regression capture locked to an asserted `Original` tab selection.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
