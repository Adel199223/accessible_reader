# ExecPlan: Stage 481 Graph Navigation Controls And Locked Layout Reset After Stage 480

## Summary
- Reopen `Graph` for the next broad Recall-parity slice after the Stage 480 `Home` overview-board audit.
- Shift the next correction away from filters and detail-drawer hierarchy and into the missing navigation/control layer of the graph canvas itself.
- Make `Graph` feel closer to Recall's current interactive-canvas direction by adding real viewport control, fit-to-view ownership, and a lock-led manual arrangement flow instead of treating the graph as a mostly fixed poster with search and drawer controls around it.

## Benchmark Basis
- Official Recall graph guidance now separates navigation/control behavior from filtering and selection:
  - [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)
- Important benchmark details from those sources:
  - the graph is an interactive canvas, not a static diagram
  - zoom and pan are core navigation, not secondary polish
  - the top-right corner includes quick view controls such as fit-to-view and lock/unlock
  - the search flow uses next/previous stepping and centers the current match
  - lock state is what makes manual node arrangement meaningful
  - layout controls become less primary while the graph is locked
- Inference from those sources:
  - because this repo does not run a live force-simulation engine, the best bounded parity move is to add a true zoom/pan viewport plus a lock-gated manual node arrangement flow and fit-to-view behavior, rather than pretending the current fixed-layout canvas already covers the navigation side of Recall's graph UX.

## Goals
- Add real canvas viewport control to wide desktop `Graph`.
- Keep the existing search, presets, timeline, content filters, path workflow, and right detail drawer.
- Make fit-to-view and lock/unlock part of the main Graph control hierarchy.
- Preserve evidence grounding, source reopen, confirm/reject actions, path exploration, and selected-node continuity.

## Scope

### 1. Add a real viewport layer
- Introduce a transformable canvas stage so the graph can zoom and pan instead of staying fixed at one scale.
- Support wheel zoom and empty-space drag pan on the main graph surface.
- Keep the bottom rail and right detail drawer outside that transform so the workspace hierarchy stays stable.

### 2. Add top-right quick view controls
- Add explicit `Fit to view` and `Lock graph` / `Unlock graph` actions beside the existing search navigation in the top-right control pod.
- Fit-to-view should reset the viewport around the current visible graph instead of only clearing filters.
- Search stepping should continue to work, and the current match should feel more centered in the working canvas.

### 3. Add lock-led manual arrangement
- Allow manual node dragging when the graph is locked so the user can keep a deliberate arrangement.
- Unlocking should return the graph toward the default computed layout instead of preserving a stale manual arrangement forever.
- Keep layout-related controls visibly secondary or disabled while the graph is locked so the lock state reads as meaningful, not decorative.

### 4. Tighten search and navigation handoff
- Keep title search in the top-right pod, but add keyboard up/down stepping support in the search field itself.
- Preserve the bottom-rail-led path and focus workflow; the new viewport work should support that flow rather than replace it.
- Keep the right detail drawer as the selected-node inspection surface after navigation changes.

## Non-Goals
- No generated-content Reader work.
- No `Reflowed`, `Simplified`, or `Summary` changes.
- No Reader generated-view UX, transform logic, placeholders, controls, or mode-routing changes.
- No backend schema or API changes unless a blocker appears. The intended solution is frontend-only.
- No full force-simulation engine or physics rewrite.
- No color-group authoring UI, sidebar group CRUD, or tag editing model that the current product does not actually support.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Graph regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- continuity docs and a new Stage 481/482 harness pair

## Validation Plan
- Targeted Vitest:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 481/482 harness pair
- live `GET 200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Expected Evidence
- Stage 481 implementation harness should capture:
  - default wide `Graph` top state with the new quick view controls visible
  - a zoomed or panned graph state that proves the canvas is no longer fixed
  - a locked layout state with a manually arranged node
  - a fit-to-view reset state that recenters the visible graph
- Stage 482 audit harness should refresh:
  - `Graph`
  - `Home`
  - original-only `Reader`
- The audit should state clearly whether `Graph` now behaves more like an interactive navigation canvas instead of a mostly fixed diagram with filters attached.

## Exit Criteria
- `Graph` has a real zoom/pan viewport layer on wide desktop.
- The top-right control pod owns fit-to-view and lock/unlock actions without reviving heavier dashboard chrome.
- Manual arrangement feels meaningful when locked, and the layout does not get stranded in a stale custom state when unlocked.
- `Home` and original-only `Reader` remain regression-stable.
