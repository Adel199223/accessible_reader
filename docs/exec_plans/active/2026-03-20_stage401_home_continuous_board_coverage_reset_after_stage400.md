# ExecPlan: Stage 401 Home Continuous Board Coverage Reset After Stage 400

## Summary
- The post-Stage-400 checkpoint still leaves `Home` as the likeliest remaining Recall-parity gap.
- The organizer rail, dominant selected-group lane, and denser card treatment are now materially closer to Recall's current library direction, but the main board still stops too early and leaves a quieter lower half than Recall's fullest filtered-card boards.
- This stage keeps the scope on `Home` only and resets the selected-group board so it carries farther down the first viewport as one continuous working surface instead of a short dense block that ends early.

## Source Direction
- Recall Tagging deep dive: the left-side tag tree drives the visible library board.
- Recall changelog direction: stronger organization, faster tag-tree browsing, and clearer card-source context on the homepage.
- Recall Jan 12, 2026 release notes: homepage cards surface source detail more clearly at a glance.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the organizer rail stable from Stage 400.
- Reset the main selected-group board so it reads closer to Recall's continuous filtered-card board:
  - increase the default visible active-group coverage so the board extends farther down before the expand affordance
  - compress the selected-group cards and footer treatment so more working content stays in the main board
  - tighten the pinned reopen sidecar again so it stays supportive without bracketing the board
  - keep the board feeling like one active library workbench instead of a short card slab plus large empty tail
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home board-coverage reset to read correctly.
- Avoid another seam-only pass: the visible result should materially change how continuously the Home board fills the first viewport.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 401/402 harness pair
- real Windows Edge Stage 401 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` no longer stops after a short dense card block followed by a large quiet lower tail.
- The selected-group board carries meaningfully farther down the first viewport while preserving scan order.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
