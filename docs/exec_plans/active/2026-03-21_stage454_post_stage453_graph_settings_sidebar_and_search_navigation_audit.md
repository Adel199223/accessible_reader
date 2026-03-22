# ExecPlan: Stage 454 Post-Stage-453 Graph Settings Sidebar And Search Navigation Audit

## Summary
- Audit the Stage 453 `Graph` settings-sidebar and search-navigation reset against Recall's current graph interaction direction.
- Judge `Graph` first on wide desktop, then verify `Home` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting Graph crops:
  - wide top
  - launcher/settings corner
  - search/navigation corner
  - settings sidebar open
  - canvas hover or preview state
  - selected-node tray and bottom trail state

## Acceptance
- The audit states clearly whether Stage 453 moved `Graph` closer to Recall's current corner-control and settings-sidebar model.
- The audit records whether top-right search now reads and behaves like graph search/navigation rather than filtering chrome.
- The audit records whether the canvas feels lighter at rest while still keeping the right inspect drawer and bottom trail effective.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 453/454 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
