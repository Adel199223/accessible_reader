# ExecPlan: Stage 49 Recall Home Selective Landing Second Pass

## Summary
- Tightened browse-mode Home into a shorter, more selective landing so populated workspaces no longer open as one long reopen ledger.
- Reduced left-rail weight, promoted the resume/nearby affordance into the main canvas when available, and capped longer recency groups behind explicit reveal controls.
- Preserved the calmer Study and Graph browse surfaces plus the focused reader-led split while updating Home.

## What Landed
- Home support rail now uses:
  - a compact collection snapshot instead of a second reopen list
  - one search card with lighter guidance copy
- Home main canvas now uses:
  - a shorter, more deliberate intro
  - a main-canvas `Resume now` zone when a focused source is available
  - a smaller default set of recency rows with `Show all …` expansion controls for larger groups
- Source tiles and reopen rows now carry lighter metadata so the landing reads less like a utilitarian log.
- A repo-owned Stage 49 Edge harness now captures refreshed Home, Graph, Study, and focused-Study screenshots.

## Fresh Artifacts
- `output/playwright/stage49-home-landing-desktop.png`
- `output/playwright/stage49-graph-browse-desktop.png`
- `output/playwright/stage49-study-browse-desktop.png`
- `output/playwright/stage49-focused-study-desktop.png`
- `output/playwright/stage49-home-selective-validation.json`

## Findings
- Home is materially calmer and more selective than the Stage 48 baseline:
  - the landing is much shorter on populated datasets
  - older reopen material no longer floods the first view
  - the sidebar no longer competes with the main collection canvas
- Graph browse mode remained stable during the Home pass.
- Study browse mode remained stable during the Home pass.
- Focused Study preserved the reader-led split and did not regress.
- The next step should be a benchmark audit rather than another immediate implementation pass.

## Decision
- Stage 49 is complete.
- Stage 50 should be `Post-Stage-49 Benchmark Audit`.
- Stage 50 should decide whether Home still needs one more bounded pass or whether another surface has become the stronger remaining benchmark mismatch.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage49_home_selective_landing_edge.mjs`

## Known Caveat
- A targeted `src/App.test.tsx` rerun was attempted for Home continuity spot checks, but it hit the same long-standing whole-file stall pattern instead of producing actionable failures. The trustworthy signal for this slice remains the targeted Home component coverage plus the real Edge screenshot harness.
