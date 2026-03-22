# ExecPlan: Stage 486 Post-Stage-485 Graph Color Groups, Legend, And Resizable Settings Audit

## Summary
- Audit the Stage 485 `Graph` settings-surface reset against Recall's current Graph View 2.0 direction.
- Judge whether color ownership now feels explicit and navigable instead of being implied by node chrome.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - default wide Graph top state with live legend visible
  - settings drawer with `Groups` section visible
  - widened settings drawer state
  - legend-driven filtered state

## Acceptance
- The audit states clearly whether Stage 485 materially reduced the remaining mismatch between Recall's current graph benchmark and our local settings workflow.
- The audit records whether the `Groups` section now makes node-color ownership legible and believable.
- The audit records whether the legend behaves like a real navigation aid instead of decorative chrome.
- The audit records whether the resizable drawer improves the settings workflow without weakening the canvas-first hierarchy.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 485/486 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
