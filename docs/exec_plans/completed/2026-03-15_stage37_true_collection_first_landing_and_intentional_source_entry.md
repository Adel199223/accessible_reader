# ExecPlan: Stage 37 True Collection-First Landing and Intentional Source Entry

## Summary
- Stage 36 confirmed the main remaining UX break was no longer the shell reset itself, but that populated `/recall` still resumed directly into focused source mode.
- This slice made source focus intentional instead of ambient by adding explicit browse-vs-focused source continuity and by reshaping the default Library surface into a calmer collection-first landing.
- Stage 34 and Stage 35 behavior stayed intact once the user intentionally entered focused source work.

## Landed Behavior
- `RecallWorkspaceContinuityState.sourceWorkspace` now tracks `mode: 'browse' | 'focused'`.
- Direct `/recall` entry and manual top-level `Library` clicks now reopen browse-first Library mode instead of auto-restoring focused source chrome.
- Source continuity is still remembered in browse mode:
  - source identity
  - last focused tab
  - embedded Reader anchor
- Default Library browse mode now uses a source card grid:
  - `Add source` tile wired into the existing import flow
  - saved-source tiles that intentionally enter focused Library/Overview mode
  - inline resume card that re-enters the last focused source/tab without forcing focus by default
- The old browse-mode `Source overview` plus inline `Search workspace` steady panels are no longer rendered on the default Library landing.
- The compact focused source strip now appears only when `sourceWorkspace.mode === 'focused'`.
- Focused `Notes`, `Graph`, and `Study` still keep embedded Reader content as the steady primary pane.
- The default Library landing now hides the right-side utility dock so the landing reads as one calmer collection canvas.

## Validation
- `frontend npm run lint`
- `frontend npm run build`
- `frontend vitest run src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose`
- `frontend vitest run src/App.test.tsx -t "source-focused mode swaps the utility dock for the compact source strip|manual Library clicks return to the browse-first landing without forgetting the last focused source tab" --maxWorkers=1 --pool=threads --testTimeout=30000 --reporter=verbose`
- repo-owned real Edge smoke via `scripts/playwright/stage37_collection_first_landing_edge.mjs`

## Notes
- A test-only `exact: true` query in `frontend/src/App.test.tsx` had to be corrected so `frontend npm run build` would typecheck and produce the latest production bundle for the real Edge smoke.
- The large whole-file `frontend/src/App.test.tsx` run still remains a known flaky path, so targeted App assertions plus repo-owned real Edge smoke remain the trustworthy validation route for this shell/workspace area.
