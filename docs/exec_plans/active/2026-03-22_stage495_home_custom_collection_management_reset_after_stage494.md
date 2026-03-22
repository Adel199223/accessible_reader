# ExecPlan: Stage 495 Home Custom Collection Management Reset After Stage 494

## Summary
- Reopen `Home` for a broader organizer-capability slice instead of another layout-only trim.
- Bring the collections lens closer to Recall's current organization direction by giving the organizer real custom collection ownership, bulk assignment, and an explicit untagged path.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Add a lightweight local custom-collection model for the organizer:
  - create custom collections
  - rename custom collections
  - delete custom collections
  - bulk-assign selected sources into one or more custom collections
- Add an explicit `Untagged` organizer branch in the collections lens so sources outside custom collections can be reviewed directly.
- Keep the current organizer workbench features intact:
  - `Collections` / `Recent`
  - sort and view controls
  - manual ordering
  - drag-and-drop
  - organizer selection bar
  - organizer resize and hide/show
- Preserve the current board-first `Home` hierarchy while letting custom collections appear as real organizer branches instead of decorative badges or helper copy.
- Keep the implementation frontend-local; do not reopen backend schema or API work for this slice.

## Acceptance
- The collections lens can create a new custom collection without leaving the organizer workbench.
- Selected organizer source rows can be assigned into custom collections in a bulk flow.
- Custom collections render as first-class organizer branches and can be renamed or deleted.
- An `Untagged` branch appears when it has meaning, so the organizer can surface sources that are still outside custom collections.
- The selected custom-collection branch still drives the right-side board without reviving older detached shelf layouts.
- The Reader lock remains explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 495/496 harness pair
- real Windows Edge runs against `http://127.0.0.1:8000`
