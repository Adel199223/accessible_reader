# ExecPlan: Stage 407 Home Minimal Entry Reset After Stage 406

## Summary
- The post-Stage-406 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 406 made the organizer rail feel more like Recall's tag-tree control surface, but the top of the page still reads as three separate introductions: a broad seam card, a rail header, and a board header.
- This stage keeps the scope on `Home` only and resets that whole entry stack together so wide desktop opens more like one active library workspace instead of a seam-plus-rail-plus-board preamble.

## Source Direction
- Recall Tagging deep dive: the left tags panel is the driver of the card list on the right, and its header is built around quick controls rather than a large explanatory hero.
- Recall Feb 6, 2026 release notes: organization improvements centered on a faster, more flexible tag tree and clearer content-management flow.
- Recall changelog direction: make organization smoother and more intuitive, not more framed.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 406 organizer-rail gains as the base rather than reopening the older flatter-sheet version.
- Reset the whole top entry stack so the page starts more like Recall's minimal homepage entry:
  - flatten the top control seam from a broad hero-like card into a slimmer status/utility strip
  - remove or relocate duplicated "next step" framing from the seam when the reopen shelf already carries that responsibility
  - tighten the organizer rail header so the tree starts sooner and feels like a working navigation surface, not a second intro card
  - slim the primary board header again so the first active cards rise higher and the board feels attached directly to the organizer choice
  - preserve the denser card board and tag-tree control surface from Stage 406
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home entry reset to read correctly.
- Avoid another micro-pass: the visible result should materially reduce the sense that `Home` opens with three stacked explanations before the real library work begins.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 407/408 harness pair
- real Windows Edge Stage 407 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` opens as one calmer library entry stack rather than a large seam card followed by two more intro headers.
- The organizer rail still feels like the thing driving the board.
- The first active cards start higher and feel more directly connected to the current organizer selection.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
