# ExecPlan: Stage 690 Notes Placement Correction To Recall-Style Notebook Model After Stage 689

## Summary
- Reopen product work after the completed Stage 688/689 Graph idle-chrome pair, but do not treat a standalone `Notes` sidebar section as the next Recall-parity target.
- Use the current Recall product evidence instead: note-taking now lives as a `Notebook` tab beside saved content plus note creation from the pen icon next to `Add`, not as a dedicated primary sidebar destination.
- Keep this slice scoped to note placement and navigation only: preserve local-first note storage, note CRUD, note search, Reader anchoring, source-adjacent notebook flows, `Graph`, `Home`, and original-only `Reader` behavior unless they are direct regression surfaces for the placement correction.

## Scope
- Update continuity so Stage 690 becomes the active checkpoint and Stage 691 becomes the paired audit.
- Replace the visible top-level `Notes` rail destination with a Recall-style embedded notebook model:
  - remove the visible `Notes` primary section from the shell/sidebar
  - keep note capability intact, but launch it from `Library` / `Home`
  - add a pen-style note entry affordance beside `Add` in the Home/Library toolbar
  - keep the source workspace tab but rename the user-facing label from `Notes` to `Notebook`
- Keep `/recall?section=notes` working as a hidden compatibility alias:
  - resolve it into `Library` / `Home`
  - reopen the notebook workspace instead of exposing a visible standalone `Notes` section again
- Reuse the existing note workbench rather than inventing a new editor:
  - keep the strong browse/detail note workspace
  - host it under `Library` / `Home` instead of as a dedicated section
  - keep note edit/delete, Reader reopen, Graph promotion, Study promotion, and note search intact
- Reframe note handoffs across the app:
  - global search note results should open the embedded notebook workspace
  - Reader `Open in Notes` style actions should become `Open in Notebook`
  - source-focused note flows should remain side-by-side beside Reader, but use `Notebook` language

## Acceptance
- The main sidebar no longer shows a visible `Notes` destination.
- `Library` / `Home` gains a pen-style note entry control beside `Add`.
- Opening note results from search, Reader, or source workspace lands in the embedded notebook workspace inside `Library` / `Home`, not in a standalone `Notes` section.
- The source workspace tab and Reader context language read as `Notebook` where they represent the saved-content-adjacent note flow.
- `/recall?section=notes` still reopens the notebook workspace for compatibility instead of breaking old handoffs.
- `Graph`, `Home`, and original-only `Reader` remain stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/RecallShellFrame.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/lib/appRoute.test.ts`
  - `frontend/src/lib/graphViewFilters.test.ts`
- targeted backend regression:
  - `backend/tests/test_api.py -k graph -q`
- `npm run build`
- `node --check` for the Stage 690/691 Playwright pair
- real Windows Edge validation against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched notebook-placement/docs/harness set

## Notes
- This milestone corrects product structure toward current Recall rather than extending the older in-repo assumption that `Notes` should stay top-level.
- The goal is to demote note placement, not to remove note capability or redesign stored note behavior from scratch.
