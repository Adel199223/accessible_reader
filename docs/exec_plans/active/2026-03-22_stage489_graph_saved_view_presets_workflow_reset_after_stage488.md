# ExecPlan: Stage 489 Graph Saved-View Presets Workflow Reset After Stage 488

## Summary
- Reopen `Graph` for the next broad Recall-parity slice after the Stage 488 Home audit.
- Keep the current canvas-first hierarchy intact:
  - minimal launcher
  - top-right title search with next/previous stepping
  - fit-to-view and lock/unlock controls
  - settings-owned filters, timeline, groups, and live view controls
  - bottom working rail plus right detail drawer for selected-node flow
- Close the remaining settings-workflow gap by replacing the fixed preset chips with a real saved-view preset model.

## Benchmark Direction
- Anchor this pass to Recall's current Graph documentation and release direction:
  - [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)
- The repo already matches the broader Recall direction on:
  - settings-owned filter, timeline, and color-group customization
  - search navigation in the top-right corner
  - fit-to-view, lock/unlock, pan, zoom, and lock-gated manual arrangement
  - bottom-rail path workflow, focus trail, and selected-node drawer exploration
- The remaining broad gap is view-state management:
  - `Explore`, `Connections`, and `Timeline` are still fixed chips instead of a real saved-view workflow
  - there is no way to save the current filter/timeline/group/view combination as a named preset
  - there is no honest `Update`, `Rename`, `Delete`, or `Reset to defaults` flow for presets
- Inference from those sources:
  - the highest-leverage next move is not another canvas trim; it is making settings feel like a real working tool with reusable named views
  - a local/session-scoped saved-view workflow is the honest parity fit for this repo because it preserves the current frontend-only track and local-first product model

## Implementation Scope

### 1. Turn presets into a real saved-view workflow
- Keep the three existing built-in presets as starter views:
  - `Explore`
  - `Connections`
  - `Timeline`
- Add a separate saved-preset layer for user-created views.
- Capture the current real view state in saved presets, including:
  - text filter
  - connection depth
  - spacing mode
  - hover-focus toggle
  - count visibility toggle
  - timeline enabled plus current timeline point
  - node/source type filters
  - color-group mode
- Do not include selected-node detail state, search-box match stepping, or transient hover state.

### 2. Add preset management actions inside the settings drawer
- Rework the current `Presets` section so it no longer reads as three static chips only.
- Add clear actions for:
  - `Save new preset`
  - `Update preset` when a saved preset is active and the current view has drifted
  - `Rename`
  - `Delete`
  - `Reset to defaults`
- Keep built-in presets immutable; saved presets can be edited.
- Make unsaved drift visible without turning the drawer into a noisy settings form.

### 3. Surface the active preset more honestly in the control seam
- Keep the top seam lightweight, but make the active preset read like a true view state instead of a decorative chip.
- Show when the current view is:
  - a built-in preset
  - a saved preset
  - a modified/unsaved variant
- Preserve the current search, fit, lock, and `Show all` ownership in the top-right corner.

### 4. Preserve the existing Graph behavior and restrictions
- Preserve:
  - canvas-first browse state
  - settings drawer ownership for filter/timeline/group controls
  - legend behavior
  - search stepping
  - path selection and shortest-path result flow
  - focus rail and jump-back ownership
  - selected-node drawer with overview/mentions/relations
- Do not reopen `Home` or `Reader` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.
- Do not add backend schema changes; the intended solution stays frontend-only.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Graph regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `frontend/src/lib/appRoute.ts` only if a small continuity type addition becomes truly necessary

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock:
  - built-in presets still apply correctly
  - `Save new preset` creates a named saved view from the current settings state
  - `Update preset` refreshes a saved view after manual changes
  - `Rename` and `Delete` work on saved presets without mutating built-ins
  - `Reset to defaults` returns the drawer to the built-in baseline
- Keep `frontend/src/App.test.tsx` aligned with the new Graph workflow so:
  - search, fit, lock, legend, path selection, and selected-node detail still coexist with saved presets
  - the active preset/readout remains visible in the control seam
- Add a new real Edge harness pair:
  - Stage 489 implementation harness for wide Graph default state, saved-preset creation state, applied saved-preset state, and preset-management state
  - Stage 490 audit harness refreshing `Graph`, `Home`, and original-only `Reader`

## Validation
- targeted Vitest for:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 489/490 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Exit Criteria
- Wide desktop `Graph` now presents presets as a real saved-view workflow instead of fixed decorative chips.
- Users can save the current Graph settings as a named view, reapply it, update it, rename it, delete it, and reset back to built-in defaults.
- The top control seam communicates the active preset state without growing back into heavy chrome.
- `Home` and original-only `Reader` stay visually stable behind the Graph pass.
