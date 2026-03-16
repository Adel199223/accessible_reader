# ExecPlan: Stage 111 Recall Home Opening Stage Unification And Nearby Flow Lift

## Summary
- Completed the bounded Home pass selected by the Stage 110 benchmark audit.
- Reduced the split staged feel between the featured `Start here` spotlight and the nearby/support reopen zone.
- Lifted the first continuation handoff so Home reads more like one selective reopen flow instead of a left feature plus right utility composition.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - moved the compact Home collection snapshot into the heading copy so it no longer competes as a separate right-side setup zone
  - kept the inline search/add utility available while reducing its visual separation from the featured reopen flow
  - preserved grouped reveals, add-source access, and the quieter `Keep going` continuation flow
- `frontend/src/index.css`
  - turned the featured Home opening into a vertical first-flow stage with the spotlight first and nearby reopen support immediately underneath
  - softened the compact nearby cards so they read more like continuation support than a competing sidebar block
  - kept Study, Graph, and focused reader-led layouts unchanged
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - added Home assertions for the compact left-side snapshot placement and the nearby-support list inside the merged opening section
- `scripts/playwright/stage111_home_opening_stage_unification_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 111 Home, Graph, Study, and focused-Study captures
- `scripts/playwright/stage112_post_stage111_benchmark_audit_edge.mjs`
  - staged the next audit harness so the post-implementation benchmark pass can run immediately

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage111-home-landing-desktop.png`
- `output/playwright/stage111-graph-browse-desktop.png`
- `output/playwright/stage111-study-browse-desktop.png`
- `output/playwright/stage111-focused-study-desktop.png`
- `output/playwright/stage111-home-opening-stage-unification-validation.json`

## Outcome
- Stage 111 is complete.
- The fresh Stage 111 state materially improves Home:
  - the opening now reads as one calmer stage with the featured spotlight followed immediately by nearby reopen support instead of splitting those choices into separate left/right zones
  - the collection snapshot now stays beside the Home heading instead of floating as its own competing setup block
  - the lighter continuation flow from Stage 107 remains intact below the first-flow stage
- Study, Graph, and focused Study stayed stable in the fresh Stage 111 artifacts.
- The next step is Stage 112 `Post-Stage-111 Benchmark Audit` so the following bounded surface pass is still chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage111_home_opening_stage_unification_edge.mjs`
- `node --check scripts/playwright/stage112_post_stage111_benchmark_audit_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
