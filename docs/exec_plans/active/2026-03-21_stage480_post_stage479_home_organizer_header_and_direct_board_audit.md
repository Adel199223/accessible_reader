# ExecPlan: Stage 480 Post-Stage-479 Home Organizer Header And Direct Board Audit

## Summary
- Audit the Stage 479 `Home` organizer-header and direct-board reset against Recall's current organization direction.
- Judge whether the organizer now owns Home navigation/control state more credibly and whether the right board starts as the immediate result surface.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - organizer header with compact controls
  - active organizer branch with slimmer direct source rows
  - selected-group board header and first rows
  - organizer-hidden compact fallback

## Acceptance
- The audit states clearly whether Stage 479 materially reduced the remaining mismatch between Recall's current organizer-led library benchmark and our local `Home` workspace.
- The audit records whether control ownership now lives more naturally in the organizer instead of a duplicated top seam.
- The audit records whether the selected board starts sooner and reads more like the direct result stage.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 479/480 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
