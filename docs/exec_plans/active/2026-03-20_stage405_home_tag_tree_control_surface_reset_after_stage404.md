# ExecPlan: Stage 405 Home Tag-Tree Control Surface Reset After Stage 404

## Summary
- The post-Stage-404 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current browse-first library flow.
- The selected-group board now feels flatter and more continuous, but wide-desktop `Home` still spends too much vertical space on top summaries before the card field starts, and the organizer rail still reads more like a supportive filter column than Recall's stronger tag-tree control surface.
- This stage keeps the scope on `Home` only and resets the organizer rail plus the primary board header together so the tree feels more like the thing driving the board and the card field starts earlier.

## Source Direction
- Recall Tagging deep dive: the left tags panel is a hierarchical tree that drives the card list on the right, with header controls for filtering and collapsing the tree.
- Recall changelog direction: stronger organization, faster tag-tree browsing, and clearer homepage card-source context.
- Recall Feb 6, 2026 release notes direction: improved organization, richer homepage context, and more deliberate management affordances around the library structure.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the selected-group sheet treatment from Stage 404 as the base rather than reopening the earlier framed board.
- Reset the organizer rail and main board entry point so `Home` reads closer to Recall's tag-tree-driven library workflow:
  - compact the top control seam again so it behaves more like a slim status seam than a large explanatory header
  - rebuild the organizer rail header into a denser control surface around the existing search and collapse behaviors
  - tighten the organizer group cards and previews so the tree reads more like a working navigation stack than a boxed side summary
  - collapse the primary board header into a slimmer inline board bar so the card field starts earlier
  - refine the selected-group cards just enough that source context reads more clearly at a glance without changing Home behavior
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home tag-tree reset to read correctly.
- Avoid another micro-pass: the visible result should materially tighten the Home entry hierarchy and make the organizer rail feel more like the primary control surface.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 405/406 harness pair
- real Windows Edge Stage 405 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` starts the active card field earlier instead of spending too much height on top explanations.
- The organizer rail feels more like a tag-tree control surface that is actively driving the board.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
