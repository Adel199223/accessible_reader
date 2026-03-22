# ExecPlan: Stage 449 Graph Corner Actions And Drawer Hierarchy Reset After Stage 448

## Summary
- The Stage 448 audit closed the current broad `Home` slice and moved the clearest remaining Recall-parity gap back to `Graph`.
- Wide desktop `Graph` is already canvas-first and much lighter than the older banner-plus-rail layout, but it still spreads working context across heavier chrome than Recall's current graph direction:
  - the top-left launcher pod still carries too much title/state weight
  - the top-right search pod still behaves more like a passive status banner than a quick-action corner
  - the tools drawer still reads like a full secondary column instead of a slimmer utility/settings sheet
  - selected-node context still competes between the top seam, the bottom trail, and the inspect drawer
- This stage resets that hierarchy in one broader pass instead of reopening another pod-spacing or chip-polish tweak.

## Source Direction
- Recall's [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation) continues to reinforce a canvas-first graph with small corner controls and a stronger bottom working flow.
- Recall's [Graph filtering and customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) reinforces the idea that the left-side graph controls should behave like a slimmer settings/filter drawer, not a competing content destination.
- Recall's [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) reinforces the idea that selection should promote a right-side inspection flow and exploration path without turning the canvas into a dashboard.
- The [Jan 12, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more) still support the broader Graph View 2.0 direction:
  - lighter graph chrome
  - stronger canvas priority
  - corner-owned controls
  - drawer-led detail and working context instead of standing pane framing

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one corner-action and drawer-hierarchy reset.
- Slim the top-left area into a truer launcher pod:
  - keep the tools toggle
  - keep section identity visible
  - stop letting selected-node state or extra copy turn it into a mini destination card
- Rework the top-right area into a truer quick-action/search corner:
  - keep node search
  - keep useful live counts/status
  - reduce passive banner framing
  - make the corner read more like a working control cluster than a header block
- Slim the tools drawer into a more utility-like settings/shortcuts sheet:
  - preserve node shortcuts and current drawer continuity
  - reduce the sense that it is a full-height secondary content column
  - prefer shorter section framing and lighter shortcut rows over stacked mini cards where possible
- Recenter selected-node context around the bottom trail plus the right inspect drawer:
  - keep the bottom trail active and useful
  - preserve `Open source` and `Clear focus`
  - stop relying on the top seam as a second selected-node destination
- Compress the inspect drawer so both peek and expanded states read more like attached drawers than stacked mini cards:
  - preserve grounded clue
  - preserve confirm/reject actions
  - preserve Reader/source handoff
  - keep expanded detail available without widening the whole canvas shell into dashboard chrome again
- Preserve all current Graph behavior:
  - node selection
  - tools drawer toggle
  - inspect drawer peek and expanded states
  - evidence grounding
  - confirm/reject actions
  - Reader/source handoff
  - recent focus trail continuity
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
- Do not widen into `Home`, `Notes`, `Study`, or backend work unless a tiny shared-shell adjustment is required for the Graph reset to read correctly.
- Keep the pass broad enough to matter: this is a control-and-drawer hierarchy reset, not another micro pass on pod spacing or badge copy.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 449/450 harness pair
- real Windows Edge Stage 449 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like a canvas with compact corner actions, a slimmer utility drawer, a stronger bottom working trail, and a right-owned inspect drawer.
- The top-left and top-right corners feel materially lighter and more task-like than the Stage 445/446 baseline.
- The tools drawer and inspect drawer feel more like attached utility drawers than competing side destinations.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
