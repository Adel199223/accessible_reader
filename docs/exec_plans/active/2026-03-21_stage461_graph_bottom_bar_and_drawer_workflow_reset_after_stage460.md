# ExecPlan: Stage 461 Graph Bottom Bar And Drawer Workflow Reset After Stage 460

## Summary
- The Stage 460 audit closed the latest broad `Home` slice and moved the clearest remaining Recall-parity gap back to `Graph`.
- Wide desktop `Graph` is materially calmer than it used to be, but the current working-state hierarchy still diverges from Recall's current graph direction in one broad way:
  - selection and path exploration still feel a bit too split between the top-right search/status corner, the settings drawer, and the bottom trail instead of reading like one clearer bottom-bar-plus-right-drawer workflow
- This stage resets `Graph` around that broader working-state issue instead of reopening another narrow pass on node chrome alone.

## Source Direction
- Recall's [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation) keeps the top-right corner focused on search and quick actions, while filters and visual tuning live in the settings sidebar.
- Recall's [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) makes the selected-node workflow explicit:
  - clicking a node opens a right-side details panel
  - the graph tracks your path in focus mode
  - the bottom bar owns clear-path and jump-back actions
  - previous nodes remain part of the path instead of competing with the top controls
- The [Jan 12, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more) reinforce that same direction:
  - card drawer
  - focus mode
  - path finding
  - graph search
  - graph settings
- The benchmark target remains directional rather than pixel-perfect: keep the top seam utility-like, make the bottom bar feel more like the real active working surface, and let the right drawer own fuller selected-node detail.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader working-state hierarchy reset.
- Slim the top-right search and status corner:
  - keep search plus `Prev` / `Next` navigation
  - demote or relocate counts and selection readouts that currently make it feel banner-like
  - keep the launcher pod and settings drawer behavior intact
- Strengthen the bottom working bar:
  - make selected-node state feel more like a bottom toolbar/path surface
  - keep jump-back chips obvious
  - keep `Open source` and `Clear focus` actions, but make them read as part of one selection workflow instead of a small passive footer
- Reduce duplicated selected-node chrome elsewhere:
  - avoid repeating pinned-node emphasis in the settings drawer when the right drawer and bottom bar already own that context
  - keep the right drawer as the fuller details surface
- Preserve current Graph behavior model:
  - settings sidebar
  - graph search
  - `Prev` / `Next` navigation
  - `Show all`
  - focus rail actions
  - right inspect drawer
  - source-backed continuity
  - reader/source handoffs
  - selection continuity
- Keep the changes broad enough to matter visually, but constrained to `Graph` presentation and workflow hierarchy rather than graph semantics or data rules.

## Guardrails
- Do not widen into `Home`, `Notes`, `Study`, backend, or storage work unless a tiny shared-shell adjustment is required for the Graph reset to read correctly.
- Keep `Reader` original-only and cosmetic-only in this parity track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 461/462 harness pair
- real Windows Edge Stage 461 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like Recall's current working-state graph direction:
  - the top-right corner feels more like utility search/navigation and less like a banner
  - the bottom bar feels like the primary path/selection workspace
  - the right drawer remains the fuller selected-node details surface without redundant selected-state framing elsewhere
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
