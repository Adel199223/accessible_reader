# ExecPlan: Recall Section Refresh Persistence Detour

## Summary
- Fixed the bug where refreshing `/recall` always returned the user to `Home` even when they had been working in `Graph`, `Study`, or `Notes`.
- Persisted the active Recall subsection in the `/recall` URL so hard refresh restores the correct workspace section without altering Reader routes or anchor behavior.
- Kept the detour bounded to route/state persistence so Stage 70 benchmark work can resume cleanly afterward.

## Implemented Changes
- `frontend/src/lib/appRoute.ts`
  - extends `AppRoute` with a `recallSection` value
  - parses `?section=` for `/recall` routes and keeps `/recall` canonical for `Home`
  - builds `/recall?section=...` URLs for non-Home Recall sections while leaving Reader anchor routes unchanged
- `frontend/src/App.tsx`
  - initializes the active Recall section from the parsed route instead of defaulting to `library`
  - syncs Recall section changes into the `/recall` URL with `replaceState` so hard refresh restores the correct section without changing the existing section-switch history feel
  - preserves Reader navigation and Reader-to-Recall return behavior while now reopening the correct Recall section after refresh
- `frontend/src/lib/appRoute.test.ts`
  - adds coverage for parsing and building Recall section URLs
- `frontend/src/App.test.tsx`
  - adds a regression test that selects `Study`, verifies `/recall?section=study`, simulates a hard refresh, and confirms the app reloads back into `Study`

## Outcome
- The refresh bug is fixed.
- Refreshing while on `Graph`, `Study`, or `Notes` now restores that same Recall section instead of dropping back to `Home`.
- Stage 70 `Post-Stage-69 Benchmark Audit` remains the active roadmap next step.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/lib/appRoute.test.ts src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
