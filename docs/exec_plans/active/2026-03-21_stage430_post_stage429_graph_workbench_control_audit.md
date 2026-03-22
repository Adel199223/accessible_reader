# ExecPlan: Stage 430 Post-Stage-429 Graph Workbench Control Audit

## Summary
- Audit the Stage 429 Graph workbench redistribution reset against the current Recall graph benchmark direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope for this track and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - top workbench control cluster
  - utility drawer state
  - bottom exploration HUD
  - inspect drawer in peek and expanded states
  - canvas-first balance
- Focused regressions second:
  - focused graph only if needed to confirm the shared graph shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 429 moved `Graph` closer to Recall’s current direct-workbench Graph View 2.0 direction.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 429/430 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
