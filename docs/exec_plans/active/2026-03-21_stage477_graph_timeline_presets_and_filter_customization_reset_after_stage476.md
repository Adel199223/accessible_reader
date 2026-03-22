# ExecPlan: Stage 477 Graph Timeline Presets And Filter Customization Reset After Stage 476

## Summary
- Reopen `Graph` for the next broad Recall-parity slice after the Stage 476 `Home` organizer-model audit.
- Shift the next correction away from corner-pod and drawer micro-polish and into the settings workflow itself.
- Make the settings sidebar materially closer to Recall's current Graph View 2.0 direction by adding named view presets, a timeline scrub/play lens, and real content filters that change the canvas and working rail in obvious ways.

## Benchmark Basis
- Official Recall guidance still centers Graph View 2.0 as a settings-led workflow rather than a static canvas:
  - [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation)
  - [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
  - [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)
- The broad remaining gap is no longer path finding or search. It is that our settings drawer still behaves like a thin control stack, while Recall's current graph emphasizes:
  - saved presets
  - creation-date timeline filtering with play/pause evolution
  - richer filtering/customization states that clearly recompose the canvas
- Inference from those sources:
  - because this repo does not yet expose user-defined tags inside the graph, the best bounded parity move is to use existing local source metadata and node types for timeline and filter ownership rather than faking a tag system.

## Goals
- Keep the canvas-first Graph shell intact.
- Make the left settings drawer the true owner of view customization.
- Let the canvas visibly change under presets, timeline, and content filters so this feels like a new workflow, not another label shuffle.
- Preserve current selected-node, focus trail, and path-finding behavior.

## Scope

### 1. Add named Graph presets
- Add a `Presets` section at the top of the settings sidebar.
- Provide 2-3 bounded named views that map to meaningful combinations of current controls and new filters, for example:
  - `Explore`
  - `Connections`
  - `Timeline`
- Presets should materially change:
  - connection depth
  - spacing
  - hover focus
  - count visibility
  - timeline mode and/or content filter defaults where appropriate
- Presets are local UI state only for this slice; no backend or URL contract changes.

### 2. Add a timeline scrub/play lens
- Derive timeline steps from the existing loaded source-document `created_at` values already available in the frontend.
- Add a `Timeline` section in the settings sidebar with:
  - a compact range/scrub control for stepping through graph history
  - a readable label for the active window
  - `Play` / `Pause` playback to animate the graph's growth over time
- Timeline filtering should recompose the visible node set using local metadata:
  - include nodes backed by source documents whose `created_at` falls inside the current timeline step/window
  - edges should follow the visible node set
- The bottom working rail and corner status should clearly indicate when the graph is in timeline mode.

### 3. Add content filters that feel like true customization
- Add a `Content` section in the settings sidebar that derives filters from current local data:
  - node-type chips from visible graph data
  - source-type chips from backing source documents (`web`, `paste`, file/document classes, etc.)
- These filters should materially narrow:
  - visible nodes
  - visible edges
  - quick picks
  - search-match navigation scope
- The rail/status copy should communicate when the graph is filtered by type/source/timeline.

### 4. Add a bounded coloring layer
- Use a restrained node-coloring cue tied to current local metadata instead of fake tag colors:
  - either primary source type or node type, whichever reads cleaner in the current data
- Keep this subtle and settings-owned.
- Do not introduce a fake “tags” model that the app does not actually support.

### 5. Preserve existing graph workflows
- Keep:
  - selected-node focus mode
  - focus trail
  - shortest-path workflow
  - right detail drawer
  - source/Reader reopen actions
  - confirm/reject flows
- If a selected node or path selection becomes hidden by timeline/filter state, preserve the current honest behavior:
  - show that the focus/path is hidden by the current view rather than silently discarding it.

## Non-Goals
- No generated-content Reader work.
- No `Reflowed`, `Simplified`, or `Summary` changes.
- No Reader generated-view UX, transform logic, placeholders, controls, or mode-routing changes.
- No backend schema or API changes unless a blocker appears during implementation. The intended solution is frontend-only, derived from already loaded source metadata and graph data.
- No new tag system.
- No destructive graph bulk actions such as delete.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Graph tests in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- if a tiny helper becomes necessary for test data or shared labeling, keep it frontend-only and bounded

## Validation Plan
- Targeted Vitest:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 477/478 harness pair
- live `GET 200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Expected Evidence
- Stage 477 implementation harness should capture:
  - default wide Graph top state
  - settings drawer with presets/content/timeline controls
  - a timeline-filtered state
  - a filtered/preset state that materially changes the canvas
- Stage 478 audit harness should refresh:
  - `Graph`
  - `Home`
  - original-only `Reader`
- The audit must state whether the drawer now behaves more like a true Graph customization surface instead of a thin control stack.

## Exit Criteria
- The Graph settings drawer materially changes the visible graph through presets, timeline, and content filters.
- The canvas and bottom rail clearly communicate those new states.
- `Graph` reads closer to Recall's current filtering/customization direction.
- `Home` and original-only `Reader` remain regression-stable.
