# ExecPlan: Stage 73 Recall Study Session Rail Compaction And Review Header Flattening

## Summary
- Completed the bounded Stage 73 Study chrome-reduction pass selected by the Stage 72 benchmark audit.
- Compressed the browse-mode Study session rail and flattened the pre-answer review framing so the prompt owns the page sooner.
- Kept Home, Graph, and focused reader-led Study stable while validating with the targeted and broad frontend suites plus fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - shortened the collapsed Study rail labels and queue overview so the browse-mode rail behaves more like compact utility than like a dashboard summary card
  - flattened the pre-answer review context row into a quieter inline strip with shorter `Review` labeling and lighter supporting copy
  - renamed the pre-answer evidence support label from `Grounding ready` to a shorter `Grounded` treatment while preserving the same preview and Reader actions
- `frontend/src/index.css`
  - narrowed the collapsed Study browse rail and reduced its toolbar/button/summary spacing so the rail consumes less visual emphasis
  - restyled the review-session strip into a flatter inline row and reduced the visible support-band treatment ahead of the prompt
  - softened the pre-answer evidence row so it behaves more like in-flow utility than like a separate footer band
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - refreshed the Study browse assertions to match the flatter `Review` strip and shorter `Grounded` pre-answer support row
- `frontend/src/App.test.tsx`
  - refreshed the broad shell assertions so the whole-file Recall Study integration coverage stays aligned with the quieter rail/header treatment
- `scripts/playwright/stage73_study_session_rail_compaction_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 73 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage73-home-landing-desktop.png`
- `output/playwright/stage73-graph-browse-desktop.png`
- `output/playwright/stage73-study-browse-desktop.png`
- `output/playwright/stage73-focused-study-desktop.png`
- `output/playwright/stage73-study-session-rail-compaction-validation.json`

## Outcome
- Stage 73 is complete.
- The fresh Stage 73 captures show a materially calmer Study browse surface:
  - the collapsed rail now reads as shorter utility rather than as a persistent dashboard column
  - the pre-answer review context is flatter and the prompt owns the page sooner
  - the pre-answer grounding support now reads more like in-flow utility than like a separate support band
- Home, Graph, and focused Study stayed stable in the fresh Stage 73 artifacts.
- The next step is Stage 74 `Post-Stage-73 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence rather than implementation momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage73_study_session_rail_compaction_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
