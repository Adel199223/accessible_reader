# ExecPlan: Stage 485 Graph Color Groups, Legend, And Resizable Settings Reset After Stage 484

## Summary
- Reopen `Graph` for the next broad Recall-parity slice after the Stage 484 `Home` manual-organizer audit.
- Keep the current canvas-first, path-first, and drawer-first Graph behaviors intact, but close the remaining settings-surface gap instead of polishing corner chrome again.
- Make the settings workflow read closer to Recall's current graph model by adding explicit color-group ownership, a live bottom-right legend, and a resizable settings drawer.

## Benchmark Direction
- Anchor this pass to Recall's current official Graph guidance:
  - [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)
- The current repo already matches the broader Recall direction on:
  - canvas-first launch
  - search stepping
  - presets and timeline controls
  - focus mode and path exploration
  - lock, pan, zoom, and fit-to-view
- The broad remaining gap is that our graph still does not clearly explain or let the user steer its color grouping model:
  - the settings drawer exposes filters and spacing, but not an explicit `Groups` ownership model
  - there is no active bottom-right legend that explains which colors map to which graph groups
  - the drawer is still fixed-width even though Recall's current docs describe a resizable settings panel
- Inference from those sources:
  - because this repo does not expose Recall's full saved-tag system, the honest parity move is a bounded local grouping model driven by existing metadata we already have: source buckets and node types
  - the legend should work as a live steering aid for those existing local groups, not a decorative static key

## Implementation Scope

### 1. Add a real `Groups` section in the Graph settings drawer
- Rework the current color ownership from implicit CSS-only node accents into an explicit settings-owned choice.
- Add a `Groups` section near the content/filter controls with a bounded group mode toggle such as:
  - `Source type`
  - `Node type`
  - `Focus only` or an equivalent minimal/off state if needed for readability
- The selected grouping mode must visibly change node accents on the canvas.
- Keep the implementation derived from current local graph metadata only:
  - source buckets already derived in `graphNodeMetaById`
  - node types already present in graph data
- Do not introduce fake saved tags, fake group persistence, or backend-backed custom groups.

### 2. Add a live bottom-right Graph legend
- Render a bottom-right legend overlay inside the canvas shell so the color mapping is visible while exploring.
- The legend should:
  - reflect the active grouping mode
  - show the visible count for each group
  - stay compact when the graph is idle
  - remain readable while focus mode, path mode, and filters are active
- Clicking a legend item should perform a real Graph action instead of doing nothing:
  - preferably toggle or apply the matching existing content filter
  - if the current grouping mode is `Source type`, use existing source-type filters
  - if the current grouping mode is `Node type`, use existing node-type filters
- If a legend click narrows the graph, the drawer status, corner state, and bottom rail should remain coherent with current filtering behavior.

### 3. Make the settings drawer resizable
- Add a draggable right-edge resize handle to the left settings drawer when it is open.
- The width should clamp to a bounded desktop range so the drawer cannot overwhelm the canvas.
- The default width should still read like the current lightweight drawer, but the user can widen it for denser filter/group work.
- The resize affordance should feel like a true utility panel feature:
  - visible handle
  - hover/drag feedback
  - no layout breakage while dragging
- Keep the resize state frontend-local for this slice unless a tiny continuity addition becomes clearly necessary.

### 4. Keep Graph’s existing exploration flow intact
- Preserve:
  - selected-node focus mode
  - bottom working rail
  - path selection and shortest-path highlighting
  - right detail drawer
  - title search stepping
  - timeline playback and presets
  - Reader/source reopen actions
  - confirm/reject actions
- If grouping/filter state hides the currently selected node or path selection, keep the current honest behavior that explains the state rather than silently discarding it.

## Explicit Restrictions
- Do not reopen `Home` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.
- Do not add backend schema changes unless a blocker appears. The intended solution is frontend-only.
- Do not add destructive bulk graph actions such as delete.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Graph regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- if needed, a tiny frontend-only route or helper adjustment is allowed, but avoid broad continuity-contract changes

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock:
  - the new `Groups` section in the settings drawer
  - the live Graph legend rendering on the canvas
  - legend-item interaction applying/toggling real existing filters
  - the resizable drawer width state changing through the new handle
- Keep `frontend/src/App.test.tsx` aligned with the new Graph workflow so:
  - the legend appears in browse mode
  - settings still open/close correctly
  - selection, hover preview, confirm/reject, and Reader/source handoffs remain stable
- Add a new real Edge harness pair:
  - Stage 485 implementation harness for wide Graph default state, settings drawer with groups visible, widened drawer state, and legend/filter interaction
  - Stage 486 audit harness refreshing `Graph`, `Home`, and original-only `Reader`

## Validation
- targeted Vitest for:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 485/486 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Exit Criteria
- The Graph settings drawer explicitly owns color grouping instead of hiding it inside CSS-only accents.
- A live legend is visible on the canvas and performs real filter handoffs.
- The settings drawer is resizable without breaking the canvas-first hierarchy.
- `Graph` reads closer to Recall's current filtering/customization direction.
- `Home` and original-only `Reader` remain regression-stable.
