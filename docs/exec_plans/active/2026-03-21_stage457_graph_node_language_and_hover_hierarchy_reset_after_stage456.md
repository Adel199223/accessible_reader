# ExecPlan: Stage 457 Graph Node Language And Hover Hierarchy Reset After Stage 456

## Summary
- The Stage 456 audit closed the latest broad `Home` slice and moved the clearest remaining Recall-parity gap back to `Graph`.
- Wide desktop `Graph` is materially calmer than it used to be, but the canvas still diverges from Recall's current graph direction in one broad way:
  - at rest, too many nodes still read like mini floating cards with title-plus-type chrome instead of lighter canvas entities that escalate more clearly on hover and selection
- This stage resets `Graph` around that broader node-hierarchy problem instead of reopening another narrow pass on launcher, drawer, or search seam details.

## Source Direction
- Recall's [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation) and [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) emphasize exploring from a canvas-first graph where selection and focus deepen context rather than every node carrying equal card weight at rest.
- Recall's [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) keeps settings/filtering secondary to the canvas itself, which reinforces a lighter default node state and stronger progressive disclosure.
- The [Jan 12, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more) continue that direction:
  - graph view as a working canvas
  - selection and navigation as the main interaction model
  - controls and details escalating around the graph rather than pre-carding every node equally
- The benchmark target remains directional rather than pixel-perfect: make the at-rest graph read more like a real canvas, while hover and selection carry more of the interpretive weight.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader node-language and hover-hierarchy reset.
- Calm the default node treatment:
  - reduce the feeling that every node is a small floating card
  - lighten the at-rest chrome and footprint
  - keep label readability without letting type metadata dominate the canvas
- Strengthen escalation from at-rest node to hover preview to selected state:
  - make hover previews feel more clearly like the first expanded read
  - keep selected-node detail ownership in the existing bottom working trail and right inspect drawer
  - avoid reintroducing heavy node cards at rest
- Preserve the current Graph behavior model:
  - settings sidebar
  - graph search
  - `Prev` / `Next` navigation
  - focus rail actions
  - right inspect drawer
  - source-backed continuity
  - reader/source handoffs
  - selection continuity
- Keep the changes broad enough to matter visually, but constrained to `Graph` presentation and hierarchy rather than graph semantics or data rules.

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
- `node --check` for the Stage 457/458 harness pair
- real Windows Edge Stage 457 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like Recall's current canvas-first graph direction:
  - at-rest nodes feel lighter and less like mini cards
  - hover previews do more of the early explanatory work
  - selected-node context still lands in the working trail and right inspect drawer rather than overloading the canvas
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
