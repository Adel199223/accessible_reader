# ExecPlan: Stage 109 Recall Home Spotlight Footprint Reduction And Utility Header Softening

## Summary
- Completed the bounded Home pass selected by the Stage 108 benchmark audit.
- Reduced the oversized feel of the `Start here` spotlight so the first reopen point feels lighter and less staged.
- Softened the Home utility/search row so it reads more like inline support than a second setup zone.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - moved the Home search and add controls into the same compact heading zone as the Home title and collection snapshot
  - tightened the `Start here` spotlight metadata so the featured reopen point carries less repeated chrome
  - kept grouped reveals, resume behavior, add-source access, and the Stage 107 continuation flow intact
- `frontend/src/index.css`
  - corrected the Home inline header so it renders as a true compact row instead of a tall stacked block
  - turned the featured Home opening into a spotlight-plus-support stage rather than a full-width spotlight slab
  - reduced spotlight padding, preview length, and utility-control weight while keeping Study, Graph, and focused layouts unchanged
- `scripts/playwright/stage109_home_spotlight_footprint_reduction_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 109 Home, Graph, Study, and focused-Study captures
- `scripts/playwright/stage110_post_stage109_benchmark_audit_edge.mjs`
  - staged the next audit harness so the post-implementation benchmark pass can run immediately

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage109-home-landing-desktop.png`
- `output/playwright/stage109-graph-browse-desktop.png`
- `output/playwright/stage109-study-browse-desktop.png`
- `output/playwright/stage109-focused-study-desktop.png`
- `output/playwright/stage109-home-spotlight-footprint-reduction-validation.json`

## Outcome
- Stage 109 is complete.
- The fresh Stage 109 state materially improves Home:
  - the `Start here` spotlight no longer reads like a tall full-width slab and now hands off more quickly into nearby reopen support
  - the Home utility/search controls now sit as quieter inline support inside the same compact heading zone instead of staging a second opening block
  - the lighter continuation flow from Stage 107 remains intact below the featured reopen stage
- Study, Graph, and focused Study stayed stable in the fresh Stage 109 artifacts.
- The next step is Stage 110 `Post-Stage-109 Benchmark Audit` so the following bounded surface pass is still chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage109_home_spotlight_footprint_reduction_edge.mjs`
- `node --check scripts/playwright/stage110_post_stage109_benchmark_audit_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
