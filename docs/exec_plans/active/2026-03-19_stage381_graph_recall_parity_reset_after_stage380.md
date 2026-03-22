# ExecPlan: Stage 381 Graph Recall-Parity Reset After Stage 380

## Summary
- Stage 380 identified `Graph` as the clearest remaining Recall-parity gap across `Home`, `Graph`, and original-only `Reader`.
- This stage resets the wide-desktop `Graph` surface as one broader workspace pass instead of another seam-by-seam trim.
- Keep `Reader` out of generated-content scope: no changes to `Reflowed`, `Simplified`, `Summary`, transform logic, generated-view UX, or mode-routing.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Replace the large hero-like Graph framing with a slimmer control seam directly above the graph surface.
- Reduce the browse rail into a lighter selector strip that keeps search and quick picks available without competing with the canvas.
- Turn node inspection into one attached right-edge tray/peek model on wide desktop.
- Keep `Home` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Home` implementation work in this stage.
- Do not change focused/narrow graph behavior except where it must inherit the new broad Graph structure safely.
- Do not change graph semantics, evidence logic, decision semantics, or Reader routing.
- Do not touch generated-content workflows anywhere in `Reader`.

## Validation
- targeted Vitest for Graph coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 381/382 harness pair
- real Windows Edge Stage 381 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like one canvas-first Recall workspace with lighter standing chrome.
- The attached inspect tray works in compact peek and expanded states without losing current actions or evidence access.
- `Home` and original-only `Reader` remain visually stable behind the Graph reset.
