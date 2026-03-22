# ExecPlan: Stage 430 Post-Stage-429 Graph Corner Controls And Focus Rail Audit

## Summary
- Audit the Stage 429 `Graph` workbench reset against the current Recall Graph View 2.0 direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - corner-control top state
  - left sidebar/settings shell
  - canvas-first shell
  - bottom focus/action rail
  - right detail drawer in peek state
  - right detail drawer in expanded state
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 429 moved `Graph` closer to Recall's current corner-control, right-drawer, bottom-focus-rail direction.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 429/430 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
