# ExecPlan: Stage 77 Recall Home Spotlight Footprint Reduction And Secondary Reopen Compression

## Summary
- Completed the bounded Stage 77 Home pass selected by the Stage 76 benchmark audit.
- Shrunk the oversized `Start here` spotlight and compressed the `Keep nearby` reopen stack so Home feels more selective and less like a staged showcase.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted/broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - Home now uses tighter featured-section display limits so the landing reaches the grouped reopen lists sooner.
  - the `Start here` spotlight copy is shorter and the secondary featured items now render through a compact `Keep nearby` row variant instead of repeating the full reopen-card treatment.
- `frontend/src/index.css`
  - reduces the featured spotlight footprint with tighter spacing, shorter preview/note copy, and a calmer card treatment.
  - turns the secondary reopen stack into a denser grouped support list with lighter dividers and compact row spacing so it behaves more like utility than like a companion column.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - keeps the Home coverage aligned with the lighter spotlight-plus-compact-nearby structure.
- `scripts/playwright/stage77_home_spotlight_footprint_reduction_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 77 Home, Graph, Study, and focused-Study captures.

## Fresh Artifacts
- `output/playwright/stage77-home-landing-desktop.png`
- `output/playwright/stage77-graph-browse-desktop.png`
- `output/playwright/stage77-study-browse-desktop.png`
- `output/playwright/stage77-focused-study-desktop.png`
- `output/playwright/stage77-home-spotlight-footprint-reduction-validation.json`

## Outcome
- Stage 77 is complete.
- The fresh Stage 77 captures show a materially calmer Home landing:
  - the `Start here` spotlight is shorter and feels more like one deliberate reopen target than like a showcase card
  - the `Keep nearby` stack is denser and less boxed, so the featured band feels more like support utility than like a second archive column
- Graph, Study, and focused Study stayed stable in the fresh Stage 77 artifacts.
- The next step is Stage 78 `Post-Stage-77 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 76.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage77_home_spotlight_footprint_reduction_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
