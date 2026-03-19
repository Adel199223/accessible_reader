# ExecPlan: Stage 373 Post-Stage-372 Home Priority Audit

## Summary
- Audit the Stage 372 Home finish milestone against the reopened user-priority queue.
- Judge `Home` first on wide desktop, then confirm that `Graph`, `Reader`, and `Notes` remain stable behind it.
- Keep `Study` parked unless a direct regression appears through shared-shell changes.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - `Reader`
  - `Notes`
- Supporting crops:
  - Home primary continue path
  - Home nearby resumptions
  - Home lower library continuation
- Focused regressions second only if Stage 372 changes shared hierarchy enough to require them

## Acceptance
- The audit states clearly whether Stage 372 made `Home` visibly more like one active collection workspace at first glance.
- The audit records whether `Home` remains the active priority or whether the queue can move to `Reader`.
- The handoff explains the result in plain language with explicit before/after artifact references.

## Validation
- `node --check` for the Stage 372/373 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
