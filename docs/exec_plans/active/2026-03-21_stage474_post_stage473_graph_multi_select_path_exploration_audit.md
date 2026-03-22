# ExecPlan: Stage 474 Post-Stage-473 Graph Multi-Select Path-Exploration Audit

## Summary
- Audit the Stage 473 `Graph` path-exploration reset against Recall's current selection-and-exploration model.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide idle top
  - multi-select path-selection state
  - path-result state
  - restored single-node focus state

## Acceptance
- The audit states clearly whether Stage 473 moved `Graph` closer to Recall's current selection-and-exploration direction.
- The audit records whether the bottom working rail now owns path selection and path results more clearly instead of remaining a passive status strip.
- The audit records whether multi-select / path mode yields the drawer and keeps the canvas legible while single-node focus still restores the drawer-led workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 473/474 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
