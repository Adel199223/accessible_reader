# ExecPlan: Stage 371 Post-Stage-370 Graph Priority Audit

## Summary
- Audit the Stage 370 Graph finish milestone against the refreshed priority queue.
- Judge `Graph` first on wide desktop, then confirm that `Home`, `Reader`, and `Notes` remain stable.
- Keep `Study` parked unless a direct regression appears through shared-shell changes.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - `Reader`
  - `Notes`
- Supporting crops:
  - Graph left rail
  - Graph node-detail dock/tray
  - one evidence-flow crop that shows whether the canvas now clearly leads
- Focused regressions second only if Stage 370 changes shared hierarchy enough to require them

## Acceptance
- The audit states clearly whether Stage 370 made `Graph` visibly calmer at first glance.
- The audit records whether `Graph` remains the active priority or whether the queue can move to `Home`.
- The handoff explains the result in plain language with explicit before/after artifact references.

## Validation
- `node --check` for the Stage 370/371 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
