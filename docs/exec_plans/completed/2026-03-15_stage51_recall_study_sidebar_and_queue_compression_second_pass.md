# ExecPlan: Stage 51 Recall Study Sidebar And Queue Compression Second Pass

## Summary
- Reworked browse-mode Study so the queue reads as lighter support instead of a second primary canvas.
- Compressed the sidebar into a queue-control rail with a persistent active-card summary, lighter queue items, and an explicit full-queue reveal.
- Shortened the review-stage explainer so the main review card becomes the first clear focal point on desktop while focused reader-led Study stays intact.

## What Landed
- Study browse rail now uses:
  - `Queue` framing instead of a second full `Study` canvas title
  - a persistent active-card summary block with counts and schedule context
  - explicit `Show all … cards` and `Show fewer cards` queue expansion
  - lighter queue-item metadata so the rail reads as support, not as a second dashboard
- Study main canvas now uses:
  - a shorter `Recall review` support card
  - more compact review-step copy so the main review card stays visually dominant
- Focused Study preserved the existing reader-led split and queue hide/show control.
- A repo-owned Stage 51 Edge harness now captures refreshed Home, Graph, Study, and focused-Study screenshots.

## Fresh Artifacts
- `output/playwright/stage51-home-landing-desktop.png`
- `output/playwright/stage51-graph-browse-desktop.png`
- `output/playwright/stage51-study-browse-desktop.png`
- `output/playwright/stage51-focused-study-desktop.png`
- `output/playwright/stage51-study-compression-validation.json`

## Findings
- Study browse mode is materially calmer than the Stage 50 baseline:
  - the queue rail is narrower and reads as queue control instead of a second content surface
  - the always-visible active-card summary reduces the need for a full-height queue wall
  - the explicit full-queue reveal keeps long backlogs available without making them the default view
  - the shortened stage explainer lets the main review card win much earlier in the page
- Home remained stable during the Stage 51 spot check.
- Graph remained stable during the Stage 51 spot check.
- Focused Study preserved the reader-led split and did not regress.
- The next step should be a benchmark audit rather than another immediate implementation pass.

## Decision
- Stage 51 is complete.
- Stage 52 should be `Post-Stage-51 Benchmark Audit`.
- Stage 52 should compare the refreshed Study surface against the benchmark before deciding whether Study needs another bounded pass or whether another surface has become the stronger remaining mismatch.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage51_study_sidebar_queue_compression_edge.mjs`

## Known Caveat
- The broad `frontend/src/App.test.tsx` suite still hits the long-standing whole-file stall mode, so the trustworthy signal for this slice remains the targeted Stage 37 coverage plus the repo-owned real Edge screenshot harness.
