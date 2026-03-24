# ExecPlan: Stage 521 Home Selected-Group Title-Wrap And Row-Height Continuity Deflation Reset After Stage 520

## Summary
- Deflate the remaining selected-group card rhythm mismatch in `Home` after the Stage 520 audit.
- Calm title wrapping and steady row-height continuity so longer selected-group titles do not reintroduce a jagged board edge.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Scope
- Wide desktop `Home` only.
- Selected-group board continuity in the active drill-in state first:
  - calmer title wrapping for longer selected-group rows
  - steadier row-height behavior so adjacent cards read more like attached results-sheet rows
  - board and list parity for the same calmer selected-group title rhythm where practical
- Do not reopen organizer-rail work, `Graph`, or generated-content `Reader` work.

## Acceptance
- Longer selected-group titles no longer create a visibly jagged lower edge across the first visible board run.
- The selected-group board keeps clear source identity while the visible rows read more like one continuous results sheet.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- targeted Vitest for `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 521/522 harness pair
- live localhost GET checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 521 run against `http://127.0.0.1:8000`
- `git diff --check`
