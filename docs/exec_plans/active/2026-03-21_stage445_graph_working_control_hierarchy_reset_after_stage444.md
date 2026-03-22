# ExecPlan: Stage 445 Graph Working-Control Hierarchy Reset After Stage 444

## Summary
- The Stage 444 audit left `Graph` as the likeliest next broad Recall-parity target.
- Wide desktop `Graph` is already canvas-first, but the remaining control chrome still reads heavier than Recall's current direction:
  - the top-left launcher pod still behaves like a mini card
  - the top-right search/status pod still feels slightly banner-like
  - the bottom path rail still reads more like passive HUD copy than an active working trail
- This stage resets that control hierarchy in one broader pass instead of reopening another seam-level trim.

## Source Direction
- Recall's [Graph navigation](https://docs.getrecall.ai/deep-dives/graph/navigation) continues to reinforce a canvas-first graph with lightweight controls that do not compete with the map.
- Recall's [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) reinforces the idea that selection should promote exploration and detail flow without turning the canvas into a dashboard.
- The [Jan 12, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more) still support the broader Graph View 2.0 direction:
  - lighter graph chrome
  - stronger canvas priority
  - clearer working exploration controls instead of standing pane framing

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one control-hierarchy reset.
- Slim the top-left launcher area into a lighter working pod:
  - keep the tools toggle
  - keep the section identity visible
  - reduce the amount of always-visible helper copy
  - stop letting the pod read like a small destination card
- Slim the top-right search/status area into a lighter corner working pod:
  - keep node search
  - keep useful live counts/status
  - reduce banner-like framing and passive explanatory weight
- Rework the bottom focus rail into a more active working trail:
  - preserve recent-path continuity
  - preserve `Open source` and `Clear focus`
  - make the trail feel like the live interaction surface for the current node instead of passive HUD text
  - keep the idle state short and quiet
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
- Keep the pass broad enough to matter: this is a control-hierarchy reset, not another copy polish or chip-spacing tweak.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 445/446 harness pair
- real Windows Edge Stage 445 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like a canvas with lighter corner working pods instead of a canvas with mini cards attached to the corners.
- The top-left launcher and top-right search/status area feel materially lighter at first glance.
- The bottom trail feels more like an active working path than a passive HUD note.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
