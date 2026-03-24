# ExecPlan: Stage 499 Post-Stage-498 Graph Filter Query And Visibility Audit

## Summary
- Audit the Stage 498 `Graph` filtering and visibility-controls reset against Recall's current Graph customization direction.
- Confirm that the settings sidebar now behaves more like a real graph-management control center and less like a lighter preset wrapper.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - settings-open default state
  - active bounded query state
  - visibility-toggles state
  - saved-view reapply state

## Acceptance
- The audit states clearly whether Stage 498 materially reduced the remaining mismatch between Recall's current Graph filtering/customization benchmark and our settings workflow.
- The audit records whether the new query model is discoverable and bounded instead of reading like raw developer syntax.
- The audit records whether the visibility toggles materially improve graph legibility and saved-view usefulness.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 498/499 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 499 confirms that Stage 498 materially reduced the remaining mismatch between the current Recall Graph filtering/customization benchmark and our local Graph settings flow.
- The settings sidebar now reads like a real graph-management control center instead of only a lighter preset wrapper:
  - bounded query language is discoverable in the drawer itself
  - visibility state and saved-view state are summarized in the same surface
  - saved views reapply the bounded query plus visibility state without widening selected-node work back into the drawer
- The live Windows Edge audit restored a saved Graph view with:
  - bounded query `search:validation`
  - `Reference content hidden`
  - the saved-view summary still visible at the top of the drawer after reapply
- `Home` and original-only `Reader` remained stable regression surfaces in the same audit run.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- Stage 498 implementation harness:
  - `output/playwright/stage498-graph-filter-query-and-visibility-controls-reset-after-stage497-closeout-validation.json`
- Stage 499 audit harness:
  - `output/playwright/stage499-post-stage498-graph-filter-query-and-visibility-audit-validation.json`
- Key Graph audit crops:
  - settings default
  - bounded query state
  - visibility state
  - saved-view reapply state

## Notes
- The current seeded graph makes `Unconnected` an honest empty-state path when a one-node bounded query is active, so the live visibility evidence focused on `Reference content hidden` while preserving the broader `Unconnected` / `Leaf nodes` controls in product and automated component coverage.
