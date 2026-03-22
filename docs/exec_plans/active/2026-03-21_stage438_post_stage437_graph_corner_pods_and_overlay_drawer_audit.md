# ExecPlan: Stage 438 Post-Stage-437 Graph Corner Pods And Overlay Drawer Audit

## Summary
- Audit the Stage 437 `Graph` canvas-stability reset against the current Recall graph direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - corner-pod control seam
  - tools/settings overlay
  - floating path rail
  - right detail drawer in peek and expanded states

## Acceptance
- The audit states clearly whether Stage 437 moved `Graph` closer to Recall's current corner-controls plus overlay-drawer direction.
- The audit records whether `Home` and original-only `Reader` remained visually stable behind the Graph pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 437/438 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
