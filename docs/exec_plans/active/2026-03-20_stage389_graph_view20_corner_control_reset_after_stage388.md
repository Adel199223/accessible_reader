# ExecPlan: Stage 389 Graph View 2.0 Corner-Control Reset After Stage 388

## Summary
- The post-Stage-388 checkpoint leaves `Graph` as the clearest remaining Recall-parity gap inside the refreshed `Graph` / `Home` / original-only `Reader` trio.
- Current Recall graph references now point more clearly toward a canvas-first Graph View 2.0 direction: lighter corner-level controls, a tighter left browse/settings drawer, and a right-side node drawer instead of a broad top seam plus a standing utility strip.
- This stage reopens `Graph` for one broader second-pass structure reset rather than another sequence of chrome-only trims.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Replace the current wide control seam with a slimmer control overlay that sits directly on the graph workbench and reads like corner-level canvas controls rather than a separate hero band.
- Collapse the standing left browse strip into a tighter attached drawer that still keeps search, quick picks, and node selection available without competing with the canvas.
- Keep the canvas visually primary and let it start higher, with less detached chrome above it.
- Keep the right-side inspect flow attached to the canvas as one drawer/tray model, and tighten the selected-node summary so it reads closer to Recall’s drawer-first detail flow.
- Add one calmer bottom workbench summary or focus band only if it helps the graph feel like one active canvas instead of a stacked dashboard.
- Preserve existing graph behavior: search filtering, node selection, confirm/reject actions, source/Reader handoffs, source-focused graph entry, and grounded evidence grouping.
- Keep `Home` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Home` implementation work in this stage.
- Do not touch generated-content workflows anywhere in `Reader`.
- Keep `Reader` original-only and cosmetic-only in this track: no `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, generated-view controls, or mode-routing changes.
- Avoid micro-stage churn: make one broad Graph hierarchy correction that specifically addresses top-level control weight, browse-strip competition, and drawer-first inspection.

## Validation
- targeted Vitest for Graph coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 389/390 harness pair
- real Windows Edge Stage 389 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` reads more like one active graph workbench and less like a top banner plus a standing utility rail.
- The canvas becomes more obviously primary, with slimmer corner controls and a lighter attached browse drawer.
- The inspect flow still preserves grounded evidence and validation actions, but it feels closer to a Recall-style drawer/tray than a separate detail stage.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
