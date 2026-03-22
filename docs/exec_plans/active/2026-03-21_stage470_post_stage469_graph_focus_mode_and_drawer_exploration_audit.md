# ExecPlan: Stage 470 Post-Stage-469 Graph Focus Mode And Drawer Exploration Audit

## Summary
- Audit the Stage 469 `Graph` selected-workflow reset against Recall's current graph exploration model.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - selected focus-mode canvas
  - expanded drawer overview
  - mentions tab/view
  - relations tab/view
  - bottom working trail

## Acceptance
- The audit states clearly whether Stage 469 moved `Graph` closer to Recall's current focus-mode and drawer-led exploration direction.
- The audit records whether selected-node work now feels more like one automatic exploration flow instead of a stacked evidence dashboard.
- The audit records whether the bottom trail and right drawer now carry more of the selected-node workflow without reopening heavy top-seam or settings-sidebar duplication.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 469/470 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
