# ExecPlan: Stage 53 Recall Study Default Queue Collapse And Stage Shell Minimization

## Summary
- Completed the bounded Stage 53 Study simplification pass identified by the Stage 52 benchmark audit.
- Made browse-mode Study land with queue support collapsed by default, including manual entry through the top-level Study tab.
- Replaced the separate `Recall review` support shell with lighter inline guidance so the main review card clearly dominates.

## Implemented Changes
- `frontend/src/lib/appRoute.ts`
  - browse-mode `study` now defaults to a collapsed drawer state unless a focused target requires a reader-led handoff
  - added a shared helper so route restoration and manual section entry use the same default-drawer rule
- `frontend/src/App.tsx`
  - manual Recall section changes now respect the new Study default-collapsed browse behavior instead of reopening the queue rail automatically
- `frontend/src/components/RecallWorkspace.tsx`
  - browse-mode Study now keeps the queue behind an explicit `Show queue` affordance on load
  - removed the standalone desktop `Recall review` support card and moved short review-flow guidance inline with the main review card
- `frontend/src/index.css`
  - tightened the inline review-flow styling while preserving the lighter queue-summary treatment
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updated targeted Study coverage for the default-collapsed queue state and the new queue-expansion flow
- `frontend/src/lib/appRoute.test.ts`
  - added coverage for the new section-specific default browse-drawer behavior

## Fresh Artifacts
- `output/playwright/stage53-home-landing-desktop.png`
- `output/playwright/stage53-graph-browse-desktop.png`
- `output/playwright/stage53-study-browse-desktop.png`
- `output/playwright/stage53-focused-study-desktop.png`
- `output/playwright/stage53-study-default-collapse-validation.json`

## Outcome
- Stage 53 is complete.
- The fresh Stage 53 captures show browse-mode Study landing with the review card clearly dominant, while Home and Graph stay stable and focused Study preserves the reader-led split.
- The next step is Stage 54 `Post-Stage-53 Benchmark Audit` so the next implementation slice is chosen from fresh benchmark evidence rather than from assumptions.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage53_study_default_queue_collapse_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite still stalls as one whole-file run, so targeted Vitest coverage plus the real Edge capture remains the trusted validation path here.
