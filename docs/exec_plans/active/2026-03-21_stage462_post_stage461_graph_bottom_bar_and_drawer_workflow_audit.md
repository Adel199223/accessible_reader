# ExecPlan: Stage 462 Post-Stage-461 Graph Bottom Bar And Drawer Workflow Audit

## Summary
- Audit the Stage 461 `Graph` working-state hierarchy reset against Recall's current graph navigation and selection direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - search/navigation corner
  - selected-node bottom working bar
  - settings drawer
  - inspect drawer expanded

## Acceptance
- The audit states clearly whether Stage 461 moved `Graph` closer to Recall's current bottom-bar-plus-right-drawer workflow direction.
- The audit records whether the top-right corner now reads more like utility search/navigation than a status banner.
- The audit records whether the bottom working bar now carries more of the selected-node and path ownership without weakening the right inspect drawer.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 461/462 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
