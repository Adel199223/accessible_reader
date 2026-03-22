# ExecPlan: Stage 469 Graph Focus Mode And Drawer Exploration Reset After Stage 468

## Summary
- Reopen `Graph` for one broader Recall-parity correction centered on selected-node exploration, not another idle-state trim.
- Current evidence shows the canvas and settings model are materially calmer, but selected-node work still feels like a stacked evidence dashboard. Official Recall graph guidance now treats selection as an automatic focus-mode flow: the canvas quiets around the active path, the bottom bar carries the trail, and the right drawer becomes the primary exploration surface.
- Keep `Home` and original-only `Reader` as regression surfaces only.

## Benchmark Direction
- Anchor this pass to Recall's current official Graph guidance:
  - [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)

## Implementation Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` so selected-node work reads more like one automatic focus-mode exploration flow.
- Strengthen canvas focus mode when a node is selected:
  - the selected node and its direct connections stay visually bright
  - unrelated ambient nodes and edges recede more clearly
  - the selected state should feel meaningfully different from idle hover behavior
- Convert the right detail drawer from one long stacked evidence wall into a calmer drawer-first exploration model:
  - compact overview/peek state first
  - explicit tab or segmented navigation for the expanded drawer
  - bounded sections for grounded clue, grouped mentions, and nearby relations instead of one always-stacked column
- Keep the bottom working trail as the main path/backtrack surface and strengthen its ownership of:
  - recent path chips
  - selected-node source continuity
  - clear/jump-back actions
- Preserve all current Graph product behaviors:
  - selected-node continuity
  - confirm/reject actions
  - source and Reader handoffs
  - settings sidebar controls
  - title search stepping
  - focus trail continuity
- Limit shared-shell changes to only what is required for the new Graph hierarchy to read correctly.

## Explicit Restrictions
- Do not reopen `Home` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock the new Graph selection hierarchy:
  - selected-node focus mode visually changes the canvas class state
  - the right drawer exposes explicit exploration tabs/segments
  - overview, mentions, and relations sections can be switched without losing selected-node context
  - bottom trail still exposes source reopen and clear-focus actions
- Keep `frontend/src/App.test.tsx` aligned with the new Graph interactions so selection, search stepping, confirm/reject, source reopen, and Reader handoff still work.
- Add a new real Edge harness pair:
  - Stage 469 implementation harness for wide Graph top state, selected focus-mode canvas, drawer overview, mentions view, and relations view
  - Stage 470 audit harness refreshing `Graph`, `Home`, and original-only `Reader`

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` and `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 469/470 harnesses
- live `200` checks for `http://127.0.0.1:8000/recall?section=graph` and `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`
