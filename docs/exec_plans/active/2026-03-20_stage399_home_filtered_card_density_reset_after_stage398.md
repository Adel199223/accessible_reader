# ExecPlan: Stage 399 Home Filtered-Card Density Reset After Stage 398

## Summary
- The post-Stage-398 checkpoint still leaves `Home` as the likeliest remaining Recall-parity gap.
- The organizer rail and dominant selected-group lane are now materially closer to Recall's current library direction, but the main board still shows too few tall cards and leaves too much quiet lower canvas compared with Recall's denser filtered-card board.
- This stage keeps the scope on `Home` only and resets the selected-group board so more of the working library stays visible above the fold without falling back into a detached archive wall.

## Source Direction
- Recall Tagging deep dive: the left-side tag tree drives the visible library board.
- Recall changelog direction: stronger organization, faster tag-tree browsing, and clearer card-source context on the homepage.
- Recall Jan 12, 2026 release notes: homepage cards surface source detail more clearly at a glance.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the organizer rail stable from Stage 398.
- Reset the main selected-group board so it reads closer to Recall's dense filtered-card board:
  - reduce the amount of intro copy and top-stage dead air above the board
  - compress selected-group cards so more of the board stays visible in the first viewport
  - tighten the pinned reopen companion shelf so it supports the board without bracketing it
  - keep the board feeling like one active working surface instead of a short grid that stops early
- Preserve current product behavior:
  - source search/filtering
  - group selection
  - reopen actions
  - `Home` to focused-source handoff
  - existing shell `Search` and `New` actions
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home board-density reset to read correctly.
- Avoid another seam-only pass: the visible result should materially change how much working content fills the main Home board.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 399/400 harness pair
- real Windows Edge Stage 399 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` no longer leaves a large quiet lower half beneath a short selected-group card set.
- The selected-group board shows meaningfully denser visible coverage above the fold without losing scan order.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
