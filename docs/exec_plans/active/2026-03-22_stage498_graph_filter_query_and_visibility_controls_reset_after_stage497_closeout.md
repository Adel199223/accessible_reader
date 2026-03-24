# ExecPlan: Stage 498 Graph Filter Query And Visibility Controls Reset After Stage 497 Closeout

## Summary
- Stage 497 closeout is complete on `main`; reopen product work on `Graph` from the clean Stage 496 parity baseline.
- The next high-leverage Recall-parity gap is no longer broad canvas chrome. It is the depth of the settings-led filtering/customization model.
- Bring `Graph` closer to Recall's current filtering and customization direction with a bounded local filter-query language, real node-visibility toggles, and saved-view continuity for those controls.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Deepen the settings sidebar filter model beyond the current plain text filter:
  - support deterministic local query parsing for `tag:`, `source:`, `name:`, and `search:`
  - support leading `-` negation
  - support bounded `OR` combinations
  - keep parsing frontend-local and deterministic; do not reopen backend search/index work
- Add explicit visibility controls that better match Recall's graph management flow:
  - show/hide unconnected nodes
  - show/hide leaf-style reference nodes
  - show/hide auto-generated/reference-style connections or nodes using the current local graph model
- Reframe the settings sidebar so query state and visibility state read like one coherent graph-management surface rather than a lighter preset wrapper.
- Preserve and extend current Graph continuity:
  - saved views must round-trip the new filter and visibility settings
  - timeline, legend, color groups, lock graph, path exploration, focus rail, and the `Card` / `Reader` / `Connections` drawer flow must keep working
- Keep `Home` and original-only `Reader` unchanged except for regression validation.
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- The Graph settings sidebar supports a bounded Recall-like filter-query flow instead of plain substring filtering only.
- Visibility toggles materially change the visible graph and are understandable from the sidebar and legend state.
- Saved views preserve the new query and visibility settings.
- The canvas, bottom rail, and right drawer stay calmer than earlier Graph passes; this stage should not regress back into chrome-heavy framing.
- `Home` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/lib/appRoute.test.ts` only if continuity state or route persistence changes
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 498/499 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Benchmark Basis
- [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization)
- [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation)
- [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
- [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)

## Assumptions
- The current local graph snapshot exposes enough metadata to support bounded query parsing and visibility filtering without backend schema changes.
- Missing metadata should fail soft by returning no extra matches rather than inventing synthetic tags or sources.
- This stage is a Graph-only reopen after the Stage 497 publish cleanup; it should not widen into `Home`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Keep the Stage 498 implementation frontend-local:
  - parse and evaluate the bounded query language in the Graph workspace rather than widening backend search or storage contracts
  - continue using the current graph snapshot plus already-loaded document metadata and local organizer state
- Map the bounded query language to the current product data without inventing new backend fields:
  - `source:` should match local source metadata such as stored source locator domains, titles, filenames, and source buckets
  - `name:` should match node labels and aliases deterministically
  - `search:` should stay name-led for node labels and aliases
  - `tag:` should use available local organizer/custom-collection labels when present and otherwise fail soft
- Map Recall-like visibility controls to the current local graph model:
  - `Show unconnected` should hide nodes with no remaining visible edges
  - `Show leaf nodes` should hide nodes that are only linked to and not linked from inside the remaining directed graph
  - `Show auto-generated/reference content` should use the current inferred-edge model as the local reference-style fallback and hide inferred-only reference-style graph content when turned off
- Saved views must round-trip the new query and visibility toggles together so the Stage 499 audit can reapply a named filtered view without manual cleanup.
