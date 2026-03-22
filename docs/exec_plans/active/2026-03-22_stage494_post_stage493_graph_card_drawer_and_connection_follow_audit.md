# ExecPlan: Stage 494 Post-Stage-493 Graph Card Drawer And Connection Follow Audit

## Summary
- Audit the Stage 493 `Graph` card-drawer reset against Recall's current selected-card and exploration direction.
- Judge whether the right drawer now behaves more like a card workspace instead of an evidence-only panel.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - default wide state
  - expanded `Card` tab
  - expanded `Reader` tab
  - expanded `Connections` tab
  - post-follow linked-card state

## Acceptance
- The audit states clearly whether Stage 493 materially reduced the remaining mismatch between Recall's current Graph benchmark and our selected-node drawer.
- The audit records whether the drawer now feels card-first instead of evidence-first.
- The audit records whether source continuity stays original-only and whether connection-follow behavior now reads as a real exploration path.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 493/494 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
