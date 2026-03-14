# ExecPlan: Stage 22 Unified Workspace Search Continuity and Result Handoffs

## Summary
- Completed on 2026-03-14.
- The shell `Search` dialog and the Library search panel now share one app-level search session instead of running as two disconnected flows.
- Search now preserves query, grouped results, and focused-result context across dialog close/reopen, Notes handoff, Reader reopen, and return-to-Library flows during the same workspace session.

## Implemented
- Lifted search query, grouped results, loading/error state, recent sources, and focused-result selection into shared app-level state in `frontend/src/App.tsx`.
- Added a reusable `WorkspaceSearchSurface` so the shell dialog and Library card render the same search model instead of duplicating behavior.
- Replaced the old Library-only `Hybrid retrieval` behavior with the shared workspace search surface and explicit focused-result actions.
- Kept `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable while preserving note, graph, study, and anchored Reader handoffs.

## Validation
- `frontend npm test -- --run`
- `frontend npm run lint`
- `frontend npm run build`
- real Edge smoke via `scripts/playwright/stage22_unified_search_continuity_edge.mjs`
- live artifacts:
  - `output/playwright/stage22-search-library.png`
  - `output/playwright/stage22-search-dialog.png`
  - `output/playwright/stage22-search-reader.png`
  - `output/playwright/stage22-search-continuity-validation.json`

## Notes
- The first real-browser attempt surfaced a real accessibility issue in the new result list: the result buttons had been given `role="listitem"`, which stripped their button semantics and names. That was fixed in the shared search surface before the final validation run.
- The Stage 22 smoke harness cleans up its disposable source documents, and the final cleanup check confirmed `0` leftover `Stage 22 Search Smoke` documents in the live workspace.
