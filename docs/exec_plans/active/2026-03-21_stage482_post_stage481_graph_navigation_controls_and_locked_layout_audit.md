# ExecPlan: Stage 482 Post-Stage-481 Graph Navigation Controls And Locked Layout Audit

## Summary
- Audit the Stage 481 `Graph` navigation-controls reset against Recall's current interactive-canvas direction.
- Judge whether wide desktop `Graph` now behaves more like a zoomable, pannable exploration surface with real fit/lock controls instead of a fixed diagram plus sidebar.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - default canvas state with quick view controls
  - zoomed or panned viewport state
  - locked layout with a manually moved node
  - fit-to-view reset state

## Acceptance
- The audit states clearly whether Stage 481 materially reduced the remaining mismatch between Recall's current graph-navigation benchmark and our local Graph browsing model.
- The audit records whether the top-right corner now owns real fit/lock behavior instead of only search and status chrome.
- The audit records whether the canvas now feels navigable before selection and drawer work begin.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 481/482 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
