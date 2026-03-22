# ExecPlan: Stage 442 Post-Stage-441 Graph Minimal Launcher And Path Rail Audit

## Summary
- Audit the Stage 441 `Graph` default-state hierarchy reset against the current Recall graph direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - minimal launcher pod and lighter search pod
  - tools/settings overlay
  - compact path rail
  - right detail drawer in peek and expanded states

## Acceptance
- The audit states clearly whether Stage 441 moved `Graph` closer to Recall's current lightweight-launcher plus compact-path-rail direction.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 441/442 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
