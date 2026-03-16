# ExecPlan: Stage 89 Recall Home Utility Search Rail Demotion And Landing Header Tightening

## Summary
- Completed the bounded Stage 89 Home pass selected by the Stage 88 benchmark audit.
- Further demoted the Home utility/search rail and tightened the landing header-to-reopen-flow handoff so the collection begins sooner and feels less column-staged.
- Kept the pass tightly bounded to Home while validating against targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - flattened the Home search utility into a lighter `Find later` support block instead of a larger card-like sidebar panel.
  - tightened the non-filter Home landing copy so the no-resume case hands off into grouped reopen sections more quickly.
  - gave the first featured reopen section a tighter leading treatment when Home opens directly into grouped reopen browsing.
- `frontend/src/index.css`
  - narrowed the Home utility/search rail and softened its snapshot chips so it reads more like quiet support than like a standing content column.
  - removed the heavier boxed styling from the search block while keeping the search field nearby and readable.
  - tightened the landing header rhythm, section spacing, and featured/follow-on reopen spacing so the upper canvas feels brisker.
- `scripts/playwright/stage89_home_utility_search_rail_demotion_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 89 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage89-home-landing-desktop.png`
- `output/playwright/stage89-graph-browse-desktop.png`
- `output/playwright/stage89-study-browse-desktop.png`
- `output/playwright/stage89-focused-study-desktop.png`
- `output/playwright/stage89-home-utility-search-rail-demotion-validation.json`

## Outcome
- Stage 89 is complete.
- The fresh Stage 89 captures show a materially calmer Home landing:
  - the utility/search side now reads flatter and more support-like instead of behaving like a second content column
  - the landing header and first reopen handoff begin sooner, so the saved-source flow feels less staged
- Study, Graph, and focused Study stayed stable in the fresh Stage 89 artifacts.
- The next step is Stage 90 `Post-Stage-89 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 88.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage89_home_utility_search_rail_demotion_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
