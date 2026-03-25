# ExecPlan: Stage 533 Graph Steering Surfaces Readability Reset After Stage 532

## Summary
- The post-Stage-532 checkpoint is in refreshed-baseline hold; the user explicitly resumed product work.
- Reopen wide-desktop `Graph` as the next bounded Recall-parity slice rather than continuing smaller `Home` or original-only `Reader` trims.
- Improve the readability and steering strength of the default Graph workbench surfaces:
  - the top-right navigation/control corner
  - the live bottom-right legend
  - the bottom working/focus rail
- Keep `Home` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Graph` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the default Graph steering surfaces without widening into backend or generated-content Reader work:
  - make the top-right search and view-control corner read more like deliberate navigation utility instead of a cramped cluster
  - make the live legend behave more like a steering aid with clearer active-group state and an obvious way to return to the full group set
  - make the bottom focus/path rail easier to scan in idle, node-selected, and path-selection states without undoing the existing path workflow
- Preserve existing Graph continuity:
  - saved views still round-trip query, visibility, timeline, and group state
  - fit-to-view, lock or unlock, hover focus, path selection, and drawer tabs keep working
  - the settings sidebar remains the owner of presets, queries, visibility, timeline, and color-group mode
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop `Graph` reads more like Recall’s current steering-first canvas direction because the control corner, legend, and focus rail are calmer and more legible at rest.
- The legend communicates active group filtering clearly and gives the user an explicit return path back to the full visible set.
- Idle, focused-node, and path-selection states remain easy to understand from the bottom rail without reopening a heavier drawer-first workflow.
- `Home` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 533/534 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 533/534 files
- repo-wide `git diff --check` remains blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 532 wide-desktop baseline artifacts:
  - `output/playwright/stage532-graph-wide-top.png`
  - `output/playwright/stage532-home-wide-top.png`
  - `output/playwright/stage532-reader-original-wide-top.png`
- Recall Graph benchmark sources already tracked in the matrix:
  - Graph navigation
  - Graph filtering and customization
  - Graph selection and exploration

## Assumptions
- The current Graph data model already exposes enough local state to improve legend and focus-rail clarity without changing graph parsing, storage, or APIs.
- This slice should stay default-state and steering-surface focused instead of reopening the selected-node drawer model or path algorithm itself.
- Stage 534 should immediately audit this Graph pass instead of auto-opening another top-level surface.

## Outcome
- Complete.
- Wide-desktop `Graph` now gives the top-right control corner, live legend, and bottom focus rail more deliberate steering weight without widening into backend or generated-content `Reader` work.
- The legend now communicates active-group state more clearly and exposes an explicit reset path back to the full visible set, while the bottom rail stays easier to scan in idle, node-selected, and path-selection states.
- `Home` and original-only `Reader` stayed regression surfaces only, and generated-content `Reader` work remained fully locked.

## Evidence
- Product correction in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- New Graph harness pair:
  - `scripts/playwright/stage533_graph_steering_surfaces_readability_reset_after_stage532.mjs`
  - `scripts/playwright/stage534_post_stage533_graph_steering_surfaces_audit.mjs`
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 533/534 harness pair
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 533 and Stage 534 runs
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- Real Windows Edge Stage 533 validation against `http://127.0.0.1:8000` recorded:
  - runtime browser `msedge` with `headless: false`
  - default legend summary `All 3 groups visible`
  - a filtered-state `Show all groups` reset affordance once a legend filter is active
  - selected-node and path-state captures driven by live graph labels discovered from the current dataset (`for validation` to `early`)
- Supporting captures:
  - `output/playwright/stage533-graph-wide-top.png`
  - `output/playwright/stage533-graph-control-corner-wide-top.png`
  - `output/playwright/stage533-graph-legend-idle-wide-top.png`
  - `output/playwright/stage533-graph-legend-filtered-wide-top.png`
  - `output/playwright/stage533-graph-focus-rail-idle-wide-top.png`
  - `output/playwright/stage533-graph-focus-rail-selected-wide-top.png`
  - `output/playwright/stage533-graph-focus-rail-path-wide-top.png`
  - `output/playwright/stage533-graph-steering-surfaces-readability-reset-after-stage532-validation.json`

## Next Recommendation
- Stage 534 should immediately audit this Graph steering-surfaces reset instead of auto-opening another top-level surface.
- If that audit clears, return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again; if the user later reopens product work, `Home` is the likeliest next bounded slice.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
