# ExecPlan: Stage 107 Recall Home Featured Flow Unification And Lower Canvas Compaction

## Summary
- Completed the bounded Home pass selected by the Stage 106 benchmark audit.
- Reduced the staged split between the featured reopen band and the lower Home continuation list.
- Made the no-resume Home landing feel more like one selective reopen flow and less like a spotlight card above an archive stack.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - added a dedicated continuation-row treatment for the lower Home follow-on flow
  - replaced the heavier archive/list-style follow-on rendering with a lighter continuation rail that stays visually tied to the featured reopen band
  - kept grouped reveals, search, add-source access, and resume behavior intact
- `frontend/src/index.css`
  - reduced the lower-canvas archive/list framing and introduced a lighter continuation grid for the `Keep going` area
  - tightened the continuation header rhythm so the lower Home flow reads as part of the same reopen sequence
  - kept Study, Graph, and focused reader-led layouts unchanged
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extended Home regression coverage so the follow-on flow asserts the lighter continuation list treatment
- `scripts/playwright/stage107_home_featured_flow_unification_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 107 Home, Graph, Study, and focused-Study captures
- `scripts/playwright/stage108_post_stage107_benchmark_audit_edge.mjs`
  - staged the next audit harness so the post-implementation benchmark pass can run immediately

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage107-home-landing-desktop.png`
- `output/playwright/stage107-graph-browse-desktop.png`
- `output/playwright/stage107-study-browse-desktop.png`
- `output/playwright/stage107-focused-study-desktop.png`
- `output/playwright/stage107-home-featured-flow-unification-validation.json`

## Outcome
- Stage 107 is complete.
- The fresh Stage 107 state materially improves Home:
  - the lower `Keep going` continuation now reads as a lighter extension of the featured reopen flow instead of a separate archive/list block
  - the no-resume Home landing now feels more continuous from `Start here` through the next reopen choices
  - the lower canvas is more compact and selective than in the Stage 106 state
- Study, Graph, and focused Study stayed stable in the fresh Stage 107 artifacts.
- The next step is Stage 108 `Post-Stage-107 Benchmark Audit` so the next bounded surface pass is still chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage107_home_featured_flow_unification_edge.mjs`
- `node --check scripts/playwright/stage108_post_stage107_benchmark_audit_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
