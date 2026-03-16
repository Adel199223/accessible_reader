# ExecPlan: Stage 57 Recall Study Support Rail Unboxing And Review Utility Demotion

## Summary
- Completed the bounded Stage 57 Study chrome pass identified by the Stage 56 benchmark audit.
- Unboxed the collapsed browse-mode Study support rail further so it reads more like lightweight queue utility than a second side card.
- Demoted the browse-mode Reader and journey utilities so the main review card keeps first visual ownership.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - browse-mode Study now gives the collapsed queue rail a lighter utility-first treatment with flatter summary stats and a smaller secondary `Refresh cards` action
  - the browse-mode top-right Reader action is removed so the source-evidence reopen path remains the primary Reader handoff
  - the boxed numbered journey tiles are replaced with flatter inline step chips while focused Study keeps the stronger reader-led utility treatment
- `frontend/src/index.css`
  - narrows the condensed Study browse layout and adds the unboxed collapsed-rail styling
  - flattens the active-card summary, stat list, and utility-button styling so the support rail reads quieter at first glance
  - replaces the old boxed browse-mode journey treatment with lighter inline flow chips
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates targeted Study browse coverage to confirm the guided review copy still holds and that browse mode now exposes only one Reader reopen action
- `scripts/playwright/stage57_study_support_rail_unboxing_edge.mjs`
  - adds the repo-owned Windows Edge harness for the fresh Stage 57 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage57-home-landing-desktop.png`
- `output/playwright/stage57-graph-browse-desktop.png`
- `output/playwright/stage57-study-browse-desktop.png`
- `output/playwright/stage57-focused-study-desktop.png`
- `output/playwright/stage57-study-support-rail-validation.json`

## Outcome
- Stage 57 is complete.
- The fresh Stage 57 captures show a lighter, narrower Study support rail and a calmer browse-mode review header while Home and Graph stay stable and focused Study preserves the reader-led split.
- The next step is Stage 58 `Post-Stage-57 Benchmark Audit` so the next implementation slice is chosen from fresh benchmark evidence rather than from momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage57_study_support_rail_unboxing_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite still stalls as one whole-file run, so targeted Vitest coverage plus the real Edge capture remains the trusted validation path here.
