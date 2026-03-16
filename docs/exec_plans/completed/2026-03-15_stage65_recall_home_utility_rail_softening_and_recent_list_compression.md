# ExecPlan: Stage 65 Recall Home Utility Rail Softening And Recent List Compression

## Summary
- Completed the bounded Stage 65 Home landing pass identified by the Stage 64 benchmark audit.
- Softened the left Home utility rail so it behaves more like quiet workspace utility than like a competing card stack.
- Compressed the grouped recent-source reopen list so Home reads less like an archive view while preserving grouped recency, search entry, add-source flow, and the calmer Study/Graph surfaces.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - Home now uses one quieter utility dock with shorter summary copy and search guidance instead of two heavier stacked sidebar panels
  - grouped recent-source reopen rows now use a flatter, lighter list treatment with reduced repeated metadata while keeping the existing recency sections and explicit `Show all …` reveals
  - Home landing headline copy is shorter so the primary canvas feels more selective
- `frontend/src/index.css`
  - adds softer Home utility-dock styling and lighter collection-snapshot metric treatment
  - turns the grouped recent-source rows into one flatter list container with tighter row density and lighter hover chrome
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - adds targeted Home utility-rail assertions and refreshes recency-row coverage for the compressed grouped-list treatment
- `scripts/playwright/stage65_home_utility_rail_softening_edge.mjs`
  - adds the repo-owned Windows Edge harness for the fresh Stage 65 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage65-home-landing-desktop.png`
- `output/playwright/stage65-graph-browse-desktop.png`
- `output/playwright/stage65-study-browse-desktop.png`
- `output/playwright/stage65-focused-study-desktop.png`
- `output/playwright/stage65-home-utility-rail-softening-validation.json`

## Outcome
- Stage 65 is complete.
- The fresh Stage 65 captures show a materially calmer Home landing: the left utility rail now reads like one quiet dock instead of like stacked support cards, and the grouped recent-source list reads less like a dense archive wall.
- Graph and Study stayed stable, and focused Study preserved the reader-led split.
- The next step is Stage 66 `Post-Stage-65 Benchmark Audit` so the next bounded follow-up is chosen from fresh benchmark evidence rather than from implementation momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage65_home_utility_rail_softening_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite is trustworthy again and was included directly in Stage 65 validation, while targeted tests plus real Edge artifacts remain the first-line UI-validation path.
