# ExecPlan: Stage 375 Post-Stage-374 Reader Priority Audit

## Summary
- Audit the Stage 374 Reader finish milestone against the reopened user-priority queue.
- Judge `Reader` first on wide desktop, then confirm that `Home`, `Graph`, and `Notes` remain stable behind it.
- Keep `Study` parked unless a direct regression appears through shared-shell changes.

## Audit Scope
- Wide desktop captures first:
  - `Reader`
  - `Home`
  - `Graph`
  - `Notes`
  - `Study` as regression-only
- Supporting crops:
  - Reader main panel
  - Reader dock / support tray
- Focused regressions second:
  - focused overview
  - focused `Graph`
  - focused `Notes`
  - focused `Study`
  - focused/narrow `Reader`

## Acceptance
- The audit states clearly whether Stage 374 made `Reader` visibly more document-first at first glance.
- The audit records whether `Reader` leaves the active slot and the queue can move to `Notes`.
- The handoff explains the result in plain language with explicit before/after artifact references.

## Validation
- `node --check` for the Stage 374/375 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
