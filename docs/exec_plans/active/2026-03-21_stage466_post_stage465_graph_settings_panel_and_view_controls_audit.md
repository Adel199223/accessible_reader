# ExecPlan: Stage 466 Post-Stage-465 Graph Settings Panel And View Controls Audit

## Summary
- Audit the Stage 465 `Graph` settings-panel reset against Recall's current graph model.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - settings sidebar open
  - depth/layout controls
  - hover-focus state
  - selected bottom rail
  - selected right detail drawer

## Acceptance
- The audit states clearly whether Stage 465 moved `Graph` closer to Recall's current settings-sidebar and view-controls direction.
- The audit records whether the left drawer now reads as a true settings sidebar rather than a mixed utility-plus-inspect rail.
- The audit records whether selected-node workflow now stays clearer in the bottom rail plus right drawer without duplicated inspect content in the left drawer.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 465/466 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
