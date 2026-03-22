# ExecPlan: Stage 433 Graph Canvas-First Drawer Reset After Stage 432

## Summary
- The Stage 432 audit moved the clearest remaining broad Recall-parity gap back to `Graph`.
- Official Recall Graph guidance still points to a canvas-first model with secondary drawers and controls around the edges rather than a graph workbench that opens with standing support panels.
- Our current `Graph` is closer than the pre-Stage-429 surface, but it still opens too eagerly into utility/detail framing: the tools rail is visible by default, the inspect lane reserves empty space before selection, and the top seam still spends more copy weight than Recall's calmer default map state.

## Source Direction
- Recall's [Graph overview](https://docs.getrecall.ai/deep-dives/graph/overview) frames Graph as an interactive map first.
- Recall's [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation) keeps the settings/sidebar entry as a corner tool instead of a permanently open rail.
- Recall's [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) describes node selection as the action that opens the right details panel, with the bottom path bar supporting focus continuity.
- Recall's [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) reinforces filters/settings living in a sidebar model rather than a default-open browse column.

## Scope
- Rework wide-desktop browse `Graph` in `frontend/src/components/RecallWorkspace.tsx`, `frontend/src/index.css`, and the small continuity defaults needed to support a calmer entry state.
- Open browse `Graph` with the tools drawer hidden by default:
  - keep the tools drawer available from the top-left control
  - keep search available in the top seam
  - keep quick-pick behavior, but treat it as an on-demand tools drawer instead of a default-open browse rail
- Remove the always-visible empty inspect lane:
  - do not reserve a right-side empty drawer before the user selects a node
  - keep the right inspect drawer attached in peek and expanded states once a node is selected
- Simplify the top seam:
  - reduce headline-copy weight
  - keep the workbench readable with a compact `Graph view` card plus metrics/search
  - add a small selected-node summary overlay when a node is pinned
- Strengthen the bottom path rail:
  - keep the recent-path chips
  - keep source reopen and clear-focus actions available when selection is active
  - remove the passive legend row so the footer reads like one true focus/path bar
- Preserve current product behavior:
  - node selection
  - graph filter query
  - quick picks
  - source-focused graph handoff
  - confirm/reject actions
  - Reader reopen from graph
- Keep `Home` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not reopen generated-content `Reader` work.
- Keep `Reader` original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Do not widen into `Home`, `Notes`, `Study`, or backend work in this stage unless a tiny shared-shell adjustment is required for the Graph reset to read correctly.
- Keep the stage broad enough to matter: this is a structural browse-state reset, not another tiny seam trim.

## Public Interfaces / Types
- No backend or API contract changes.
- Frontend continuity may update Graph's default browse-drawer behavior so the canvas-first state is the default browse entry.

## Validation
- targeted Vitest for `src/lib/appRoute.test.ts`, `src/components/RecallWorkspace.stage37.test.tsx`, and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 433/434 harness pair
- real Windows Edge Stage 433 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop browse `Graph` opens with the canvas visually primary and the tools drawer hidden by default.
- The right inspect drawer only appears once a node is selected.
- The top seam is slimmer and less headline-driven while still keeping search and status available.
- The bottom bar reads as one true focus/path rail instead of a focus rail plus passive legend.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
