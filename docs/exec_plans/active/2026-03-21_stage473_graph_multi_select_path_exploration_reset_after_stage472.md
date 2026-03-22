# ExecPlan: Stage 473 Graph Multi-Select Path-Exploration Reset After Stage 472

## Summary
- Reopen `Graph` for one broader Recall-parity correction centered on path exploration and multi-node selection, not another small seam trim.
- Current evidence shows the canvas, settings sidebar, focus mode, and drawer hierarchy are materially calmer, but the graph still lacks a true path-finder workflow. Official Recall references describe selecting two nodes, using a path action, and tracing the shortest connection while the drawer yields to the exploration state.
- Keep `Home` and original-only `Reader` as regression surfaces only.

## Benchmark Direction
- Anchor this pass to Recall's current official Graph guidance:
  - [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)

## Implementation Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` so selected-node exploration and path exploration feel like two distinct but compatible modes.
- Add a real graph path-selection workflow:
  - support a bounded multi-select gesture for graph nodes on desktop
  - show that selection state in the bottom working rail instead of keeping the rail as mostly passive copy
  - expose a clear path action when two nodes are selected
  - compute and highlight the shortest visible connection through the current graph
- Rebalance the selected-workflow hierarchy:
  - single-node selection should still drive focus mode and the right drawer
  - multi-select / path mode should temporarily quiet the right drawer and let the bottom rail become the primary workflow surface
  - path results should be visibly legible on the canvas without reviving bulky top chrome
- Preserve existing Graph product behavior:
  - settings sidebar
  - title search and prev/next navigation
  - filter query
  - connection-depth and spacing controls
  - hover focus and count visibility toggles
  - single-node focus mode
  - confirm/reject node and edge actions
  - source reopen and Reader handoff
- Limit shared-shell changes to only what is required for the new Graph hierarchy to read correctly.

## Explicit Restrictions
- Do not reopen `Home` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock the new Graph path workflow:
  - multi-select enters a path-selection state without reviving heavy top chrome
  - the bottom rail becomes the active selection/path toolbar
  - path results highlight the visible connection and keep the drawer out of the way
  - single-node focus still restores the drawer-led workflow
- Keep `frontend/src/App.test.tsx` aligned with the new Graph interactions so node selection, multi-select/path finding, source reopen, and Reader handoff all still work.
- Add a new real Edge harness pair:
  - Stage 473 implementation harness for wide Graph idle state, path-selection state, path-result state, and restored single-node focus state
  - Stage 474 audit harness refreshing `Graph`, `Home`, and original-only `Reader`

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` and `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 473/474 harnesses
- live `200` checks for `http://127.0.0.1:8000/recall` and `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`
