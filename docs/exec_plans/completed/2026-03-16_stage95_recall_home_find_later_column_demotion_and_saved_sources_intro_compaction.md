# ExecPlan: Stage 95 Recall Home Find Later Column Demotion And Saved Sources Intro Compaction

## Summary
- Completed the bounded Stage 95 Home pass selected by the Stage 94 benchmark audit.
- Further demoted the left `Find later` utility/search area and compressed the `Saved sources` intro so the featured reopen flow starts more immediately.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - shortened the default Home utility copy so the left rail now reads as lighter support instead of as a second setup panel.
  - compressed the default `Saved sources` landing intro and merged-header copy so the featured reopen flow starts sooner.
  - kept add-source entry points, grouped recency reveals, and the featured plus follow-on reopen structure intact.
- `frontend/src/index.css`
  - narrowed the Home landing support column and tightened its spacing, metrics, and search field rhythm.
  - reduced the merged `Saved sources` header spacing and copy footprint so the spotlight card begins closer to the top of the canvas.
  - kept Study, Graph, and focused reader-led layouts unchanged.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updated the Home utility-rail assertion to match the shorter support copy while keeping the search-entry and collection-snapshot guarantees.
- `scripts/playwright/stage95_home_find_later_column_demotion_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 95 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage95-home-landing-desktop.png`
- `output/playwright/stage95-graph-browse-desktop.png`
- `output/playwright/stage95-study-browse-desktop.png`
- `output/playwright/stage95-focused-study-desktop.png`
- `output/playwright/stage95-home-find-later-column-demotion-validation.json`

## Outcome
- Stage 95 is complete.
- The fresh Stage 95 captures show a materially calmer Home landing:
  - the left `Find later` utility/search area now reads more like quiet support and less like a standing column
  - the `Saved sources` intro no longer pushes the first featured reopen point as low as before
- Study, Graph, and focused Study stayed stable in the fresh Stage 95 artifacts.
- The next step is Stage 96 `Post-Stage-95 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 94.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage95_home_find_later_column_demotion_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
