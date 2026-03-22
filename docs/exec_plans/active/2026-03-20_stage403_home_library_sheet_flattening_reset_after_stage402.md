# ExecPlan: Stage 403 Home Library Sheet Flattening Reset After Stage 402

## Summary
- The post-Stage-402 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current browse-first library flow.
- The organizer rail, dominant selected-group lane, and longer active-group coverage are now materially closer to Recall's current library direction, but the selected-group board still reads as a framed cluster of dense cards with a visible stop point instead of one continuous working library sheet.
- This stage keeps the scope on `Home` only and resets the selected-group board so it feels flatter, more continuous, and more integrated with the expand affordance while preserving the stronger organizer-driven structure from Stage 402.

## Source Direction
- Recall Tagging deep dive: the left-side tag tree drives the visible library board, so the board should feel like the primary browsing surface rather than a separate inset block.
- Recall changelog direction: stronger organization, faster tag-tree browsing, and clearer collection context on the homepage.
- Recall Jan 12, 2026 release notes: homepage cards surface source detail more clearly at a glance while staying inside a cohesive library board.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the organizer rail stable from Stage 402.
- Reset the main selected-group board so it reads closer to Recall's continuous filtered-card sheet:
  - increase the default visible active-group coverage again so the board lands lower before the expand affordance
  - flatten the card field so the selected-group board feels less like isolated inner slabs and more like one continuous library sheet
  - integrate the footer affordance into that board more cleanly so the stop point feels softer and later
  - tighten the pinned reopen sidecar slightly again so it supports the board without framing it
- Preserve current product behavior:
  - source search and filtering
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home library-sheet reset to read correctly.
- Avoid another seam-only pass: the visible result should materially change how sheet-like and continuous the Home board feels.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 403/404 harness pair
- real Windows Edge Stage 403 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` no longer reads like a framed dense block with a hard internal stop.
- The selected-group board feels more like one continuous library sheet with a softer footer transition.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
