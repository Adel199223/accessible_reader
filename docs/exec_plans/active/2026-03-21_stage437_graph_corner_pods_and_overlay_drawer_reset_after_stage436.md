# ExecPlan: Stage 437 Graph Corner Pods And Overlay Drawer Reset After Stage 436

## Summary
- The Stage 436 audit closed the current broad `Home` slice and moved the clearest remaining Recall-parity gap back to `Graph`.
- Official Recall graph guidance now consistently describes the graph as one interactive canvas with:
  - a settings/sidebar entry from the top left
  - search and view controls in the top right
  - a right slide-out drawer for full card content
  - a visible path/trail model while navigating nodes
- Our current `Graph` is materially better than the pre-Stage-433 surface, but it still spends too much of the canvas budget on a text-heavy top seam, a full-width bottom rail, and left/right canvas padding that reflows the workbench when the tools drawer or detail drawer opens.

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
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader canvas-stability reset.
- Replace the current text-heavy top seam with compact corner pods:
  - top-left tools/settings entry
  - top-right search and lightweight status
  - no large descriptive banner competing with the canvas
- Keep the tools drawer hidden by default, but make it read more like a true settings/sidebar overlay instead of a layout column that steals canvas width.
- Keep the node detail drawer on the right, but stop reflowing the canvas around it:
  - treat peek and expanded detail as overlay drawers
  - keep the graph field visually stable when opening and closing node detail
- Rework the current full-width bottom focus rail into a smaller floating path rail:
  - preserve the recent-path chips and actions
  - make it read more like an active trail and less like a bottom HUD banner
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
- No route or continuity schema changes are expected unless a tiny local Graph-state helper adjustment is needed for the overlay reset.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 437/438 harness pair
- real Windows Edge Stage 437 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads as one stable interactive canvas instead of a canvas padded around open chrome.
- The top seam becomes compact corner-level control pods rather than a text-led banner.
- The tools/settings panel reads like a true overlay sidebar.
- The node detail drawer reads like a right slide-out overlay instead of a drawer that shrinks the main workbench.
- The recent-path model stays useful but no longer reads like a full-width bottom HUD.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
