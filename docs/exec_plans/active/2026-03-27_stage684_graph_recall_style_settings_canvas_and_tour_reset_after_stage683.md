# ExecPlan: Stage 684 Graph Recall-Style Settings, Canvas, and Tour Reset After Stage 683

## Summary
- Reopen `Graph` as an explicit user-directed Recall-parity milestone after the post-Stage-683 hold checkpoint.
- Treat the March 26, 2026 user-provided Recall Graph screenshots plus the Recall Graph docs and January 12, 2026 Graph View 2.0 release notes as the new wide-desktop `Graph` benchmark.
- Keep this slice `Graph`-only: `Home`, `Notes`, `Study`, and original-only `Reader` stay regression surfaces, and focused reader-led `Graph` stays a regression flow rather than a redesign target.

## Scope
- Update browse-Graph continuity and benchmark docs so Stage 684 becomes the active checkpoint and `Graph` is the sole active milestone until Stage 685 audits clean.
- Keep the backend graph snapshot/detail APIs, route shape, saved-view semantics, filter-query logic, and local-first storage untouched.
- Refactor the browse-Graph presentation layer out of the largest `RecallWorkspace.tsx` branch into bounded frontend Graph subcomponents while leaving the shared Graph state and handlers in place.
- Reset wide-desktop browse `Graph` toward the new Recall benchmark:
  - dock the `Graph Settings` panel open by default on the left
  - keep the graph canvas dominant and calmer at rest
  - move title search plus previous/next navigation, `Fit to view`, and `Lock graph` into a compact top-right corner
  - replace the full-width idle focus rail with a compact bottom-left count pill and bottom-right help or replay-tour controls
  - expand into a contextual focus/path tray only when a node is selected or a path workflow is active
  - restyle the canvas from pill-card nodes toward calmer circular nodes with external labels, thinner edges, darker ambient canvas, and simpler hover/selection/path emphasis
  - keep the selected-node inspect workflow, but make it a calmer contextual drawer or panel instead of default-state dashboard chrome
- Preserve advanced Graph capabilities inside the left settings panel even if Recall's screenshots show fewer exposed controls:
  - presets and saved views
  - filter query
  - visibility toggles
  - timeline
  - groups / color mode
  - fit / lock / unlock
  - multi-select shortest-path workflow
- Add a local-first dismissible Graph View tour that mirrors the screenshot sequence:
  - welcome modal
  - customize/settings card
  - navigation/search/fit/lock card
  - help card
  - filter-by-tag/group card
  - discover-connections card
- Store tour dismissal and replay state in existing frontend continuity only; do not add backend schema, routes, or storage tables.

## Acceptance
- Wide-desktop browse `Graph` reads materially closer to the March 26 Recall screenshots because the surface is settings-first on the left, canvas-first in the middle, and no longer dominated by floating dashboard seams.
- The default idle state shows a docked left settings panel, compact top-right search/navigation controls, a small bottom-left count pill, and small bottom-right help or replay-tour controls.
- The canvas now uses calmer circular node markers, external labels, thinner edges, and a more Recall-like radial/force-balanced distribution while preserving deterministic enough behavior for tests and existing manual lock/drag continuity.
- The idle state no longer shows the old persistent full-width focus rail; the contextual focus/path tray appears only for selected-node or path workflows.
- The selected-node inspect drawer stays grounded and useful, but no longer makes the default browse state feel like a dashboard.
- The new Graph tour is dismissible, replayable, local-only, and aligned to the Recall screenshot flow.
- Focused reader-led `Graph`, `Home`, and original-only `Reader` remain stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/lib/graphViewFilters.test.ts`
- targeted backend regression:
  - `backend/tests/test_api.py -k graph`
- `npm run build`
- `node --check` for the new Stage 684/685 Playwright harness pair
- real Windows Edge validation against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 684/685 touched set

## Notes
- This milestone supersedes the older Stage 533/534 steering-surfaces benchmark as the active wide-desktop `Graph` target.
- Shared shell/header work stays out of scope unless a direct Graph parity blocker cannot be solved inside the Graph section itself.
