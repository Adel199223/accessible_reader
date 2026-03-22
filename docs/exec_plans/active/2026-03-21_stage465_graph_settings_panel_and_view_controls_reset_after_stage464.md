# ExecPlan: Stage 465 Graph Settings Panel And View Controls Reset After Stage 464

## Summary
- Reopen `Graph` for one broader Recall-parity correction focused on the settings model, not another seam-level trim.
- Current evidence shows the canvas is calmer, but the left drawer still behaves like a mixed utility-plus-inspect rail. Official Recall graph guidance now reserves the left sidebar for filters, groups, layout, and appearance, while selected-node work lives in the bottom bar plus right details drawer.
- Keep `Home` and original-only `Reader` as regression surfaces only.

## Benchmark Direction
- Anchor this pass to Recall's current official Graph guidance:
  - [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)

## Implementation Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` so the left drawer reads like a true settings sidebar instead of a mixed browse-plus-inspect rail.
- Remove selected-node inspect copy from the settings drawer. The drawer should stop duplicating grounded clue and node-inspect content when a node is selected.
- Keep selected-node work owned by the bottom working trail and the right detail drawer. This pass should strengthen that split instead of blurring it.
- Add a clearer settings-panel structure with bounded controls that fit the current product:
  - filter query
  - connection-depth control
  - layout spacing control
  - appearance toggles such as hover-focus and node-count visibility
  - visible-node jump list
- Apply those controls to the live graph canvas so they are not decorative:
  - connection depth should materially change how much of the orbit stays visible
  - spacing should materially change node spread
  - hover-focus should dim unrelated nodes and edges when enabled
  - count visibility should change the at-rest node label density
- Keep the top-right graph-search corner compact and utility-first. Do not reopen a banner-like seam or move filtering back into the search corner.
- Keep all current Graph product behaviors:
  - selected-node continuity
  - focused path trail
  - confirm/reject actions
  - source and Reader handoffs
  - right detail drawer peek and expanded flows
- Limit shared-shell changes to only what is required for the new Graph hierarchy to read correctly.

## Explicit Restrictions
- Do not reopen `Home` design work in this stage except for shared regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock the new Graph settings-panel hierarchy:
  - settings-only drawer structure
  - no selected-node inspect block inside the left drawer
  - connection-depth/layout/appearance controls present
  - hover-focus and count-visibility class-state changes
- Keep `frontend/src/App.test.tsx` aligned with the new Graph interactions so node selection, search stepping, confirm/reject, source reopen, and right-drawer behavior still work.
- Add a new real Edge harness pair:
  - Stage 465 implementation harness for Graph top state, settings-open state, hover-focus state, and selected-node drawer state
  - Stage 466 audit harness refreshing `Graph`, `Home`, and original-only `Reader`

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` and `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 465/466 harnesses
- live `200` checks for `http://127.0.0.1:8000/recall?section=graph` and `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`
