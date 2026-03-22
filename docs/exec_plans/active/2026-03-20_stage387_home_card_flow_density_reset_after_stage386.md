# ExecPlan: Stage 387 Home Card-Flow Density Reset After Stage 386

## Summary
- The post-Stage-386 hold-state review leaves `Home` as the clearest remaining Recall-parity gap inside the refreshed `Graph` / `Home` / original-only `Reader` trio.
- Wide desktop `Home` is calmer than before, but it still carries too much hero framing and too much empty primary-lane space compared with Recall’s denser saved-source card flow.
- This stage reopens `Home` for one broader second-pass density reset instead of another sequence of small trims.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Compress or demote the current large opening `Saved library` stage so it stops reading like a hero card above the real work.
- Start the primary saved-source flow higher and make it denser so the workspace reads like one active card view instead of a header block plus a sparse lower canvas.
- Reduce the amount of blank left-lane space in the current primary flow and bring the strongest reopen/saved items into the visible work area sooner.
- Keep the left browse/filter awareness available, but make it feel lighter and more attached to the card flow instead of a separate top-stage panel.
- Preserve existing local-first behaviors: reopen actions, grouped sections, search filtering, source handoff, and focused-source entry.
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Graph` implementation work in this stage.
- Do not touch generated-content workflows anywhere in `Reader`.
- Keep `Reader` original-only and cosmetic-only in this track: no `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, generated-view controls, or mode-routing changes.
- Avoid micro-stage churn: make one broad Home hierarchy correction that specifically addresses density and blank-space balance.

## Validation
- targeted Vitest for Home coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 387/388 harness pair
- real Windows Edge Stage 387 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like a dense saved-source card workspace and less like a hero panel above a sparse library.
- The main card flow starts higher, fills the primary lane more deliberately, and reduces the obvious blank-canvas gap.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
