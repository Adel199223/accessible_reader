# ExecPlan: Stage 81 Recall Home Featured Band Compaction And Empty-Canvas Reduction

## Summary
- Completed the bounded Stage 81 Home pass selected by the Stage 80 benchmark audit.
- Flattened the Home featured band into one compact reopen flow and reduced surrounding canvas weight so the landing feels brisker and more selective.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - reduced the default featured-section payload so Home opens with fewer featured rows before `Show all …` expansion.
  - removed extra spotlight note copy and shortened the featured support badge from `Keep nearby` to `Nearby` so the featured band reads lighter by default.
- `frontend/src/index.css`
  - tightened the Home landing padding, canvas spacing, and header rhythm so the saved-source flow begins sooner.
  - flattened the featured band into one wider spotlight plus a compact two-card support row instead of a tall spotlight-plus-column split.
  - gave the compact nearby reopen cards lighter individual framing so they no longer depend on one larger boxed support column.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates the Home browse assertions to lock in the slimmer default featured band and the smaller nearby support set.
- `scripts/playwright/stage81_home_featured_band_compaction_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 81 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage81-home-landing-desktop.png`
- `output/playwright/stage81-graph-browse-desktop.png`
- `output/playwright/stage81-study-browse-desktop.png`
- `output/playwright/stage81-focused-study-desktop.png`
- `output/playwright/stage81-home-featured-band-compaction-validation.json`

## Outcome
- Stage 81 is complete.
- The fresh Stage 81 captures show a materially calmer Home landing:
  - the featured band now reads as one compact reopen flow instead of a spotlight-plus-sidebar split
  - the top Home canvas feels brisker because the featured payload and surrounding spacing are both shorter by default
- Study, Graph, and focused Study stayed stable in the fresh Stage 81 artifacts.
- The next step is Stage 82 `Post-Stage-81 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 80.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage81_home_featured_band_compaction_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
