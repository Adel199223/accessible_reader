# ExecPlan: Stage 441 Graph Minimal Launcher And Compact Path Rail Reset After Stage 440

## Summary
- The Stage 440 audit closed the current broad `Home` slice and moved the clearest remaining Recall-parity gap back to `Graph`.
- Official Recall graph guidance now consistently describes the graph as one interactive canvas with:
  - a settings/sidebar entry from the top left
  - search and view controls in the top right
  - a right slide-out drawer for full card content
  - a visible path/trail model while navigating nodes
- Our current `Graph` is materially better than the pre-Stage-437 surface, but it still spends too much of the default canvas budget on:
  - a launcher pod that still reads like a small text card instead of a lightweight top-left entry
  - a bottom path rail that still reads like a banner instead of a compact trail
  - node cards that still feel slightly too large and keep the map from opening as airy as Recall's current graph

## Source Direction
- Recall's [Graph View 2.0 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more) describe:
  - a right slide-out card drawer
  - a visual path trail while navigating connected nodes
  - graph search
  - a dedicated settings panel
- Recall's [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation) says:
  - the search bar sits in the top right
  - quick view controls also sit in the top right
  - the settings sidebar opens from the top left
  - the sidebar can stay open while you explore
- Recall's [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) reinforces the settings-sidebar model with filters, layout, appearance, and presets grouped inside that side panel.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader default-state hierarchy reset.
- Compress the top-left launcher pod into a smaller tools entry:
  - keep the existing show/hide drawer behavior
  - keep selected-node continuity visible when pinned
  - reduce the descriptive card feel so the map stays visually primary
- Tighten the top-right search pod so it reads more like a lightweight search/status control than a second banner.
- Keep the tools drawer and detail drawer behaviors intact, but align their idle framing with the smaller launcher seam.
- Rework the bottom path rail into a smaller floating trail:
  - preserve recent-path chips and actions
  - preserve `Open source` and `Clear focus`
  - reduce the HUD-banner feel in the default state
- Slightly tighten node card footprints so more of the graph reads at once without changing graph semantics.
- Preserve all current behaviors and semantics:
  - node selection
  - evidence grounding
  - confirm/reject actions
  - Reader/source reopen
  - recent-path continuity
  - tools drawer toggle
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
- Keep the pass broad enough to matter: this is a workbench hierarchy reset, not another chip-spacing or dock-padding trim.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route or continuity schema changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 441/442 harness pair
- real Windows Edge Stage 441 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` opens with a smaller top-left launcher and a lighter top-right search pod.
- The path rail stays useful but reads like a compact floating trail instead of a banner.
- The default canvas state feels airier before any drawer is opened.
- Tools and detail drawers still read as attached overlays when opened.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
