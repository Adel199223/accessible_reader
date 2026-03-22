# ExecPlan: Stage 458 Post-Stage-457 Graph Node Language And Hover Hierarchy Audit

## Summary
- Audit the Stage 457 `Graph` node-language and hover-hierarchy reset against Recall's current canvas-first graph direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - wide canvas top
  - hovered node preview
  - selected-node canvas plus working trail
  - inspect drawer expanded

## Acceptance
- The audit states clearly whether Stage 457 moved `Graph` closer to Recall's current canvas-first direction.
- The audit records whether the at-rest node treatment now reads less like a field of mini cards.
- The audit records whether hover and selection now provide a clearer progressive disclosure ladder without weakening the working trail or inspect drawer.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 457/458 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
