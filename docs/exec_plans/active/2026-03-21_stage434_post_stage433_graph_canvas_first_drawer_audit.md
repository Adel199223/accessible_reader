# ExecPlan: Stage 434 Post-Stage-433 Graph Canvas-First Drawer Audit

## Summary
- Audit the Stage 433 `Graph` browse reset against the current Recall Graph direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - default wide top with tools hidden
  - slimmer top control seam
  - tools sidebar open state
  - bottom focus/path rail
  - right detail drawer in peek state
  - right detail drawer in expanded state

## Acceptance
- The audit states clearly whether Stage 433 moved `Graph` closer to Recall's canvas-first, drawer-secondary default state.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 433/434 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
