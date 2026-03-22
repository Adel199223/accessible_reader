# ExecPlan: Stage 450 Post-Stage-449 Graph Corner Actions And Drawer Hierarchy Audit

## Summary
- Audit the Stage 449 `Graph` corner-action and drawer-hierarchy reset against the current Recall graph direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - launcher pod
  - quick-action/search corner
  - tools drawer
  - working trail
  - inspect drawer peek
  - inspect drawer expanded

## Acceptance
- The audit states clearly whether Stage 449 moved `Graph` closer to Recall's current corner-action, slimmer-drawer, canvas-first direction.
- The audit records whether the top-left launcher, top-right quick-action/search corner, bottom trail, and right inspect drawer now read as one clearer working hierarchy than the Stage 446 baseline.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 449/450 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
