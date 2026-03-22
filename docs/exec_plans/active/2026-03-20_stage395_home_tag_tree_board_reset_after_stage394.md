# ExecPlan: Stage 395 Home Tag-Tree Board Reset After Stage 394

## Summary
- The post-Stage-394 checkpoint leaves `Graph`, `Home`, and original-only `Reader` in a refreshed-baseline hold state, but the next highest-leverage Recall-parity gap is `Home`.
- Current Recall references now emphasize a stronger tag tree in the left panel, denser organization controls, and a filtered card list that stays visibly connected to that tree instead of opening with a large explanatory board and too much empty central canvas.
- This stage reopens `Home` for one broader library-board reset instead of another seam-level density trim.

## Source Direction
- Recall Tagging deep dive: tag hierarchy in the left panel, filtered card list on the right, and homepage cards showing source details.
- Recall changelog, Feb 6, 2026: improved organization with tag tree flexibility, expand/collapse support, and better large-library responsiveness.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the organizer rail visibly closer to Recall's current tag-tree direction:
  - denser header and summary treatment
  - search kept prominent
  - compact tree preview behavior instead of tall repeated cards
- Reset the main board so the working content starts sooner:
  - reduce the sense of a large empty primary shell
  - pull the pinned reopen card and active group list higher
  - make the selected-group board feel like the dominant right-side list rather than a secondary companion
- Carry more visible document/source metadata directly in the board rows and reduce explanatory copy that competes with the saved-source content.
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home reset to read correctly.
- Avoid micro-stage churn: make one broad `Home` hierarchy correction that specifically addresses tag-tree density, library-board fullness, and central dead-space reduction.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 395/396 harness pair
- real Windows Edge Stage 395 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like a dense tag-tree-driven library board and less like a composed hero shell with a large empty center.
- The organizer rail feels like a stronger control surface, while the selected-group list becomes the obvious main board.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
