# ExecPlan: Stage 397 Home Board-Fill Reset After Stage 396

## Summary
- The post-Stage-396 checkpoint leaves `Home` as the likeliest remaining Recall-parity gap.
- The organizer rail is materially closer to Recall's current tag-tree direction, but the main selected-group board still compresses the actual working list into too little visible area and leaves too much dead center in the primary stage.
- This stage keeps the scope on `Home` only and resets the board so the filtered-card list feels like the main workspace instead of a narrow companion lane.

## Source Direction
- Recall Tagging deep dive: left-side tag tree drives the visible library board.
- Recall changelog, February 6, 2026: improved organization, faster tag tree behavior, expand/collapse support, and homepage card sources visible.
- Recall Jan 12, 2026 release notes: homepage cards show source detail more clearly at a glance.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the organizer rail stable from Stage 396.
- Reset the main board so the selected-group area feels fuller and more like Recall's filtered card list:
  - make the selected-group board occupy the obvious primary lane
  - render the selected-group list as a denser multi-card board instead of a narrow single-lane stack
  - demote the pinned reopen shelf so it reads as a compact companion rail, not a co-equal destination
  - trim remaining explanatory copy that creates visual dead air above the board
- Preserve current product behavior:
  - source search/filtering
  - group selection
  - reopen actions
  - `Home` to focused-source handoff
  - existing `Search` and `New` shell actions
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home board reset to read correctly.
- Avoid another seam-only pass: the visible result should materially change how much working content fills the main Home board.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 397/398 harness pair
- real Windows Edge Stage 397 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` no longer reads like a large empty board beside two narrower side lanes.
- The selected-group board becomes the obvious main working surface with denser visible card coverage.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
