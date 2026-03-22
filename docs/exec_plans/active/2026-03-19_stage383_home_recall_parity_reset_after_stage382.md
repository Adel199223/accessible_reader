# ExecPlan: Stage 383 Home Recall-Parity Reset After Stage 382

## Summary
- Stage 382 left `Home` as the clearest remaining Recall-parity gap in the active `Graph` -> `Home` -> original-only `Reader` track.
- This stage resets wide-desktop `Home` as one broader workspace pass instead of another card-by-card trim.
- Keep `Reader` out of generated-content scope: no changes to `Reflowed`, `Simplified`, `Summary`, transform logic, generated-view UX, or mode-routing.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Replace the large hero-like Home framing with a slimmer control seam directly above the saved-library workspace.
- Reduce the current split `lead card + saved-library rail + lower continuation shell` into one more Recall-like browse flow:
  - a lighter left browse/filter strip
  - one stronger right-side card/list workspace
- Promote saved sources higher and earlier so the main visual weight is the card flow, not the opening panel chrome.
- Keep current local-first behaviors intact: reopen actions, search filtering, source grouping, source handoff, and focused-source entry.
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Graph` implementation work in this stage.
- Do not change source-grouping semantics, search semantics, route behavior, or source handoff behavior.
- Do not touch generated-content workflows anywhere in `Reader`.
- Avoid micro-stage churn: make one broad Home hierarchy correction rather than several minor trims.

## Validation
- targeted Vitest for Home coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 383/384 harness pair
- real Windows Edge Stage 383 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like one active saved-library workspace with lighter standing chrome.
- The left browse/filter strip supports search and section awareness without competing with the main card flow.
- `Graph` and original-only `Reader` remain visually stable behind the Home reset.

## Result
- Completed on March 19, 2026.
- Wide desktop `Home` now uses a slimmer control seam, a lighter browse strip, a denser primary saved-source flow, and one calmer lower continuation lane instead of the older hero-plus-split-library composition.
- Existing Home behaviors stayed intact: reopen actions, search filtering, grouped sections, source handoff, and focused-source entry were preserved.
- `Graph` implementation stayed out of scope, and `Reader` remained original-only and cosmetic-only with no generated-content changes.
