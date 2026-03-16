# ExecPlan: Stage 75 Recall Home Utility Rail Demotion And Featured Reopen Prioritization

## Summary
- Completed the bounded Stage 75 Home pass selected by the Stage 74 benchmark audit.
- Demoted the Home utility rail and turned the featured reopen area into one deliberate primary reopen target plus lighter secondary rows instead of another equal-weight card wall.
- Kept Graph, Study, and focused reader-led work stable while validating with the targeted Home suite, the broad App suite, frontend lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - Home now promotes the first featured reopen item into a single `Start here` spotlight and shifts the remaining featured items into lighter `Keep nearby` rows
  - the resume band now reuses the same lighter reopen-row treatment for nearby sources so Home no longer stacks multiple secondary card columns
- `frontend/src/index.css`
  - demotes the Home utility rail by narrowing it, removing the old boxed sidebar shell, and restyling the collection snapshot into smaller utility pills plus a softer search module
  - replaces the broad featured reopen grid with a spotlight-plus-support layout so the landing reads more like one deliberate reopening lane than like an archive wall
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extends the Home assertions to verify that the featured reopen section now exposes one `Start here` spotlight plus lighter `Keep nearby` secondary reopens
- `scripts/playwright/stage75_home_utility_rail_demotion_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 75 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage75-home-landing-desktop.png`
- `output/playwright/stage75-graph-browse-desktop.png`
- `output/playwright/stage75-study-browse-desktop.png`
- `output/playwright/stage75-focused-study-desktop.png`
- `output/playwright/stage75-home-utility-rail-demotion-validation.json`

## Outcome
- Stage 75 is complete.
- The fresh Stage 75 captures show a materially calmer Home landing:
  - the utility rail now reads as lighter secondary support instead of a full boxed sidebar
  - the featured reopen surface now offers one deliberate starting point with quieter nearby reopens, which reduces the remaining archive-wall rhythm
- Graph, Study, and focused Study stayed stable in the fresh Stage 75 artifacts.
- The next step is Stage 76 `Post-Stage-75 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of carrying forward assumptions from Stage 74.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage75_home_utility_rail_demotion_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
