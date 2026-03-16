# ExecPlan: Stage 71 Recall Home Landing Canvas Tightening And Card-Wall Flattening

## Summary
- Completed the bounded Stage 71 Home landing pass selected by the Stage 70 benchmark audit.
- Tightened the Home header/canvas transition and flattened the featured saved-source wall so the populated landing reads more like a selective reopening surface than like an archive grid.
- Kept Graph, Study, and focused reader-led work stable while validating with the existing targeted and broad frontend suites plus fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - restyled the featured Home source tiles into a denser reopen treatment with an inline source-type/date topline and a quieter single-line footer
  - moved the featured-section `Show all …` control into the section header so the collection starts sooner and avoids the older footer-led card-wall rhythm
- `frontend/src/index.css`
  - tightened the Home landing shell spacing across the utility rail, landing header, canvas gap, and section spacing so the collection begins sooner
  - explicitly forced the Home landing header and featured-section header back into a horizontal flow to override the generic stacked `section-header` baseline
  - reduced featured tile height, padding, preview depth, and border weight so the reopen surface behaves more like a flatter selective strip than like a gallery
- `scripts/playwright/stage71_home_landing_canvas_tightening_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 71 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage71-home-landing-desktop.png`
- `output/playwright/stage71-graph-browse-desktop.png`
- `output/playwright/stage71-study-browse-desktop.png`
- `output/playwright/stage71-focused-study-desktop.png`
- `output/playwright/stage71-home-landing-canvas-tightening-validation.json`

## Outcome
- Stage 71 is complete.
- The fresh Stage 71 captures show a materially calmer Home landing:
  - the title/header band now consumes less vertical space before the collection begins
  - the featured reopen surface now reads as shorter, flatter, and more utility-like than the older tall archive-card wall
  - the inline featured-section reveal control reduces the old footer-led card-wall feel
- Graph, Study, and focused Study stayed stable in the fresh Stage 71 artifacts.
- The next step is Stage 72 `Post-Stage-71 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of carrying forward assumptions from Stage 70.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage71_home_landing_canvas_tightening_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
