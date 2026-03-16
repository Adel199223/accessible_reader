# ExecPlan: Stage 97 Recall Home Utility Column Collapse And Saved Sources Header Action Demotion

## Summary
- Completed the bounded Stage 97 Home pass selected by the Stage 96 benchmark audit.
- Collapsed more of the lingering Home utility-column feel and demoted the merged `Saved sources` header/action chrome so the featured reopen flow starts more immediately.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted plus broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - moved `Add source` into the quieter Home utility/search support so the top landing header no longer competes with the first reopen point.
  - simplified the merged no-resume `Saved sources` header copy and removed the earlier chip/action stack from above the featured reopen card.
  - moved the grouped `Show all …` reveal control below the first reopen flow so it behaves like secondary support instead of primary chrome.
- `frontend/src/index.css`
  - narrowed the Home utility column further and tightened the Home support/search rhythm.
  - reduced the merged `Saved sources` header footprint so the spotlight card begins sooner on desktop.
  - kept Study, Graph, and focused reader-led layouts unchanged.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updated Home assertions so the utility rail now guarantees the in-rail `Add source` entry and the merged section no longer expects header-level action chrome.
- `scripts/playwright/stage97_home_utility_column_collapse_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 97 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage97-home-landing-desktop.png`
- `output/playwright/stage97-graph-browse-desktop.png`
- `output/playwright/stage97-study-browse-desktop.png`
- `output/playwright/stage97-focused-study-desktop.png`
- `output/playwright/stage97-home-utility-column-collapse-validation.json`

## Outcome
- Stage 97 is complete.
- The fresh Stage 97 captures show a materially calmer Home landing:
  - the left support now reads more like a compact utility dock than like a dedicated setup column
  - the merged `Saved sources` row no longer puts a chip plus action stack above the `Start here` reopen flow
  - the grouped reveal now reads as follow-on support below the initial reopen path instead of as pre-card setup chrome
- Study, Graph, and focused Study stayed stable in the fresh Stage 97 artifacts.
- The next step is Stage 98 `Post-Stage-97 Benchmark Audit` so the next bounded surface pass is chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage97_home_utility_column_collapse_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
