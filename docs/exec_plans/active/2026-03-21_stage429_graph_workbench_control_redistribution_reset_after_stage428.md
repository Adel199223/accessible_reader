# ExecPlan: Stage 429 Graph Workbench Control Redistribution Reset After Stage 428

## Summary
- The post-Stage-428 checkpoint leaves `Graph` as the clearest remaining broad Recall-parity gap in the active `Graph` / `Home` / original-only `Reader` trio.
- Current official Recall graph references still point to a more direct Graph View 2.0 workbench: lighter corner-level controls, a top-left drawer entry, a graph-level search/control feel instead of a descriptive hero overlay, a right-side details drawer, and lighter bottom exploration support.
- This stage reopens `Graph` for one broader workbench redistribution reset rather than another isolated chrome trim.

## Source Direction
- Recall's [Knowledge Graph Overview](https://docs.getrecall.ai/deep-dives/graph/overview) emphasizes the graph as an interactive map first, with controls in support of exploration rather than a dashboard stacked around it.
- Recall's [Navigation & Controls](https://docs.getrecall.ai/deep-dives/graph/navigation) and [Filtering & Customization](https://docs.getrecall.ai/deep-dives/graph/filtering-and-customization) point to top-level graph controls, a sidebar opened from the top-left, and lighter workbench-level filtering/search behavior.
- Recall's [Selection & Exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration) keeps the right-side details panel and bottom-path exploration language central once a node is selected.
- The remaining mismatch in our current `Graph` is not semantics; it is layout weight. The canvas is strong, but the left utility strip still behaves like a small secondary workspace, the top overlay still reads like a descriptive intro card, and the bottom band still feels more like a footer card than a workbench exploration strip.

## Scope
- Rework wide-desktop `Graph` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 390 Graph View 2.0 and Stage 428 regression behavior intact as the base.
- Make one broader hierarchy correction:
  - redistribute search from the standing left drawer into the top workbench controls so discovery starts at the canvas level
  - retire the current descriptive top-left overlay card and replace it with a lighter corner-control cluster
  - reduce the left drawer into a denser utility/settings-style rail that prioritizes quick picks over explanatory copy
  - slim the bottom focus band into a lighter workbench HUD so it supports exploration without reading like a separate summary card
  - keep the right-side inspect tray attached, but tighten its peek header/body so it reads more like a Recall drawer and less like a stacked support panel
- Preserve all current graph behavior:
  - filter/search semantics
  - node selection
  - confirm/reject actions
  - source and Reader handoffs
  - source-focused graph entry
  - grounded evidence grouping and selected-node continuity
- Keep `Home` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Home`, `Notes`, `Study`, or backend implementation work in this stage.
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
- Avoid false feature mimicry. Do not invent unsupported graph behavior just to resemble Recall. This is a layout and interaction-surface reset around existing graph capabilities.

## Validation
- targeted Vitest for Graph coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 429/430 harness pair
- real Windows Edge Stage 429 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Graph` opens with a more direct workbench feel: lighter corner controls, a denser auxiliary drawer, and less descriptive chrome competing with the canvas.
- Search begins at the graph workbench level instead of feeling trapped inside the side drawer.
- The bottom exploration support reads like a light HUD rather than a separate footer card.
- The inspect drawer still preserves grounded evidence and actions, but its peek reads closer to Recall’s right-side details flow.
- `Home` and original-only `Reader` remain visually stable behind the Graph pass.
