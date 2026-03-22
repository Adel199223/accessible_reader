# ExecPlan: Stage 453 Graph Settings Sidebar And Search Navigation Reset After Stage 452

## Summary
- The Stage 452 audit closed the latest broad `Home` slice and moved the clearest remaining Recall-parity gap back to `Graph`.
- Wide desktop `Graph` is materially calmer than it used to be, but the current control model still diverges from Recall's current graph UX in three visible ways:
  - the top-left launcher still reads like a labeled tools pod instead of a minimal settings-sidebar toggle
  - the top-right search field still behaves like a filtering strip instead of a graph-search-and-navigation corner
  - the canvas still relies on large always-visible node cards rather than lighter exploration cues with richer preview only when needed
- This stage resets `Graph` around that interaction model instead of reopening another tray-size or pod-spacing trim.

## Source Direction
- Recall's [Graph navigation and controls](https://docs.getrecall.ai/deep-dives/graph/navigation) now defines:
  - an arrow button in the top left that opens the settings sidebar
  - a search bar in the top right that finds cards by name and supports next/previous match navigation
  - a corner-level control model instead of a banner-like workbench header
- Recall's [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) keeps filtering inside the settings sidebar rather than merging it into the graph-search field.
- Recall's [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) reinforces that selection opens the right-side details panel while exploration stays canvas-first and path-aware.
- The [Jan 12, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more) reinforce the same direction: card drawer, focus mode, graph search, connection depth control, graph settings, and a lighter canvas-first exploration flow.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader interaction reset.
- Replace the current labeled top-left tools pod with a more Recall-like launcher:
  - one compact sidebar toggle
  - a clearer settings-sidebar identity when open
  - less persistent title/chrome in the corner itself
- Split search and filtering into distinct roles:
  - top-right becomes graph search and match navigation
  - left sidebar owns filter input and graph-tuning controls
  - current text narrowing behavior stays available, but it should no longer masquerade as graph search
- Add lighter exploration cues on the canvas:
  - introduce hover or preview affordances for nodes
  - reduce the need for every node to read like a mini card at rest
  - keep selection and inspect flow explicit without making the whole graph feel like a grid of cards
- Preserve the existing right-side inspect drawer and bottom working trail:
  - selected-node continuity
  - source reopen
  - confirm/reject actions
  - trail chips and clear-focus behavior
- Keep the pass broad enough to matter: this is a graph interaction-model reset, not a micro pass on pod radius, chip spacing, or copy wording.

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
- Do not fake unsupported graph behaviors with misleading labels. If a control appears, it should map to a real visible behavior in this product.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 453/454 harness pair
- real Windows Edge Stage 453 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like a Recall-style graph exploration surface:
  - left settings ownership is obvious
  - top-right search behaves like node search/navigation, not filtering chrome
  - the canvas feels lighter and more exploratory at rest
- The right inspect drawer and bottom trail still carry the selected-node workflow without visual regressions.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
