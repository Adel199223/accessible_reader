# ExecPlan: Stage 552 Post-Stage-551 Home Grouped-Overview Row Density And Attached Footer Audit

## Summary
- Audit the Stage 551 wide-desktop `Home` grouped-overview row-density and attached-footer reset against Recall's current organizer-owned overview direction.
- Confirm that grouped-overview board rows now read denser without the third-line preview-detail band and that the `Captures` footer reads as attached continuation.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview card-body density at rest
  - primary-lane plus secondary-stack composition after the row-density simplification

## Acceptance
- The audit states clearly whether Stage 551 materially reduced the remaining grouped-overview row-density mismatch against the current Recall benchmark direction.
- The audit records whether grouped-overview board rows now hold without the visible preview-detail band and whether the footer reads like attached continuation.
- The audit records whether the card-body simplification improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 551/552 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 551/552 files

## Outcome
- Completed.
- The Stage 552 audit confirmed that Stage 551 succeeded overall: wide-desktop `Home` now keeps denser grouped-overview source rows with no visible preview-detail band inside `Captures`, `Web`, or `Documents`, and the `Captures` footer reads like attached continuation.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed locked out of scope.

## Evidence
- Validation passed with:
  - `node --check` for the Stage 551/552 harness pair
  - real Windows Edge Stage 552 audit against `http://127.0.0.1:8000`
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - targeted `git diff --check -- ...` over the touched Stage 551/552 files
- The Stage 552 audit recorded `0` grouped-overview row-detail nodes, a `58.16px` maximum grouped-overview row height, a `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.
- The audit also refreshed `Graph` and original-only `Reader` at `http://127.0.0.1:8000`, with the Reader regression capture locked to an asserted `Original` tab selection.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded slice, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
