# ExecPlan: Stage 429 Graph Corner Controls And Focus Rail Reset After Stage 428

## Summary
- The Stage 428 audit moved the clearest remaining broad Recall-parity gap back to `Graph`.
- Official Recall Graph docs now point to a control model with a top-left settings/sidebar entry, top-right quick controls, a right-side details drawer, and a bottom selection/path bar.
- Our current `Graph` workbench is closer than the pre-Stage-389 version, but it still spends too much space on a wide top overlay and too little on a true focus-path workbench.

## Source Direction
- Recall's [Graph overview](https://docs.getrecall.ai/deep-dives/graph/overview) frames Graph View 2.0 as an interactive map first, not a dashboard with headline chrome.
- Recall's [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation) places the settings sidebar entry in the top-left corner and quick actions in the top-right corner.
- Recall's [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) describes a right-side details panel plus an automatic bottom focus/path bar with clear and jump-back actions.
- Recall's [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) reinforces the sidebar-as-settings model rather than a permanent browse rail framed like a content panel.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx`, `frontend/src/index.css`, and the small continuity types needed to support a lightweight visited-node focus trail.
- Replace the current broad top overlay copy band with compact corner controls:
  - top-left sidebar entry using the existing browse toggle as the settings/sidebar handle
  - top-right compact quick-control cluster with graph metrics and a compact find-node input using the current filter behavior
- Reframe the left `Graph selector strip` as a lighter settings/search sidebar shell:
  - keep current search and quick-pick behavior
  - reduce headline-card framing and instructional copy
  - keep the sidebar clearly secondary to the canvas
- Replace the current bottom focus band plus passive legend chips with a bottom focus/action rail:
  - show the active node and current exploration state
  - add a clear-focus action
  - add a bounded visited-node trail with jump-back chips if the state fits cleanly in frontend continuity
  - keep source handoffs available from the graph workbench without forcing the right drawer open
- Keep the right detail dock as the primary inspect drawer:
  - preserve peek and expanded states
  - preserve confirm/reject and source reopen actions
  - only trim header chrome as needed so it fits the new corner-control hierarchy
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
- Keep the stage broad enough to matter: this is not another seam-level trim. The top control model and bottom focus model should both move.

## Public Interfaces / Types
- No backend or API contract changes.
- Frontend continuity may grow a lightweight graph focus-trail field if needed for the bottom rail and jump-back chips.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 429/430 harness pair
- real Windows Edge Stage 429 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` uses a compact corner-control model instead of the current wide top overlay.
- The left sidebar reads more like a settings/search sidebar than a standing browse panel.
- The bottom of the graph workbench now carries active focus/selection actions instead of only passive legend chips.
- The right detail drawer remains the primary inspect surface and still supports peek/expanded states cleanly.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
