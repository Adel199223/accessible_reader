# ExecPlan: Stage 446 Post-Stage-445 Graph Working-Control Hierarchy Audit

## Summary
- Audit the Stage 445 `Graph` control-hierarchy reset against the current Recall graph direction.
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
  - search/status pod
  - working trail
  - tools overlay
  - inspect drawer

## Acceptance
- The audit states clearly whether Stage 445 moved `Graph` closer to Recall's current light-control, canvas-first direction.
- The audit records whether the launcher pod, search/status pod, and working trail now read lighter and more active than the Stage 442 baseline.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 445/446 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
