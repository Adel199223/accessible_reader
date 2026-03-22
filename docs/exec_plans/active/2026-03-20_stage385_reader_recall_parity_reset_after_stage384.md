# ExecPlan: Stage 385 Reader Recall-Parity Reset After Stage 384

## Summary
- Stage 384 left original-only `Reader` as the clearest remaining Recall-parity gap in the active `Graph` -> `Home` -> original-only `Reader` track.
- This stage resets wide-desktop `Reader` as one broader workspace pass instead of another chrome-only trim.
- Keep generated-content Reader work completely out of scope: no changes to `Reflowed`, `Simplified`, `Summary`, transform logic, generated-view UX, generated placeholders, generated-view controls, or mode-routing.

## Scope
- Rework wide-desktop `Reader` in `frontend/src/components/ReaderWorkspace.tsx` and `frontend/src/index.css`.
- Compress the current stacked Reader hero, control ribbon, and glance bar into a slimmer top seam so the article starts higher.
- Promote the original document lane so the article becomes the main visual weight of the workspace.
- Reduce the current right-side support area into a calmer attached dock that still preserves source-library access and note adjacency.
- Keep current original-only behaviors intact: `/reader` route, original document rendering, read-aloud controls, search/highlight continuity, source handoff, and notes support.
- Keep `Graph` and `Home` as regression checkpoints only during this stage.

## Guardrails
- Do not change generated-content workflows anywhere in `Reader`.
- Do not change mode-routing, transform logic, generated placeholders, generated-view controls, or any `Reflowed`, `Simplified`, or `Summary` behavior.
- Do not widen into `Graph` or `Home` implementation work in this stage.
- Avoid micro-stage churn: make one broad Reader hierarchy correction rather than another sequence of small trims.

## Validation
- targeted Vitest for Reader coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 385/386 harness pair
- real Windows Edge Stage 385 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop original-only `Reader` reads more like one reading-first workspace with lighter standing chrome.
- The article lane starts higher, occupies more of the visible workspace, and feels more dominant than the support dock.
- Source-library access and notes adjacency remain available without reading like a competing secondary product surface.
- No generated-content Reader workflow or behavior changes are introduced.
