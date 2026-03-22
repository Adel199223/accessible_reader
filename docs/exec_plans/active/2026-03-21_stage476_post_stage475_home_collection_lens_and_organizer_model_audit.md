# ExecPlan: Stage 476 Post-Stage-475 Home Collection Lens And Organizer Model Audit

## Summary
- Audit the Stage 475 `Home` organizer-model reset against Recall's current organization direction.
- Judge whether the new organizer reads more like a true collection driver and less like a recency bucket list with upgraded styling.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - default `Collections` lens top state
  - switched `Recent` lens state
  - organizer-hidden compact-controls state

## Acceptance
- The audit states clearly whether Stage 475 materially reduced the remaining mismatch between the Recall benchmark and our current `Home` organizer model.
- The audit records whether the organizer now owns grouping more credibly instead of depending on recency-only buckets.
- The audit records whether the right-side board reflects the active organizer lens cleanly without reopening a split-shelf hierarchy.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 475/476 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
