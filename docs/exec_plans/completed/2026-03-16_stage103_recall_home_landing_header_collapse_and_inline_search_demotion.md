# ExecPlan: Stage 103 Recall Home Landing Header Collapse And Inline Search Demotion

## Summary
- Completed the bounded Stage 103 Home pass selected by the Stage 102 benchmark audit.
- Collapsed the remaining split Home landing header so the first featured reopen flow starts more immediately below the Home heading.
- Demoted the inline search/add treatment into quieter utility support while keeping Study, Graph, and focused reader-led work stable in validation.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - converted the populated Home landing header from a mini hero plus separate right-side utility block into one tighter header treatment
  - collapsed the visible Home meta into compact snapshot pills so the populated landing no longer uses the old summary paragraph above the first reopen flow
  - preserved search behavior, add-source access, grouped reveals, featured/nearby/keep-going reopen flows, and the existing filtered/empty/error states
- `frontend/src/index.css`
  - overrode the generic vertical `section-header` behavior for the Home header so the heading and snapshot pills collapse into a compact row
  - reduced the visual weight of the inline search/add controls and tightened the header spacing
  - kept Study, Graph, and focused reader-led layouts unchanged
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extended Home regression coverage so populated Home states assert the compact header path without the old summary paragraph
- `scripts/playwright/stage103_home_landing_header_collapse_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 103 Home, Graph, Study, and focused-Study captures

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage103-home-landing-desktop.png`
- `output/playwright/stage103-graph-browse-desktop.png`
- `output/playwright/stage103-study-browse-desktop.png`
- `output/playwright/stage103-focused-study-desktop.png`
- `output/playwright/stage103-home-landing-header-collapse-validation.json`

## Outcome
- Stage 103 is complete.
- The fresh Stage 103 state materially tightens the Home landing:
  - the populated Home header now collapses into one compact heading-and-snapshot row instead of a mini hero plus a separate utility block
  - the inline search/add controls now read like quieter support utility instead of a second top-of-page setup zone
  - `Start here` begins sooner and with less staged setup above it than in the Stage 101 and Stage 102 state
- Study, Graph, and focused Study stayed stable in the fresh Stage 103 artifacts.
- The next step is Stage 104 `Post-Stage-103 Benchmark Audit` so the next bounded surface pass is still chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage103_home_landing_header_collapse_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
