# ExecPlan: Stage 61 Recall Study Pre-Reveal Evidence Minimization And Queue Rail Softening

## Summary
- Completed the bounded Stage 61 Study browse-mode support-demotion pass identified by the Stage 60 benchmark audit.
- Minimized the pre-reveal evidence footprint so the review flow keeps first ownership before the learner reveals the answer.
- Softened the browse-mode queue rail framing so it reads more like nearby review utility than like a second panel.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - browse-mode Study now uses a compact pre-reveal `Grounding ready` summary with explicit `Preview evidence` and Reader handoffs instead of always showing the fuller evidence block
  - the fuller browse-mode evidence section now expands only after reveal or intentional preview, while focused Study keeps the stronger reader-led support treatment
  - browse-mode queue controls now use lighter utility-button treatment, and preview state resets cleanly when the active card changes or a review is logged
- `frontend/src/index.css`
  - softens the collapsed browse-mode queue rail by making the unboxed rail override the default card shell for real and by slightly narrowing the condensed Study layout
  - adds the compact pre-reveal evidence summary styling plus lighter support-action treatments
  - keeps the Stage 59 lower-stack compression gains while making the browse-mode rail and pre-reveal support feel quieter
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extends targeted Study browse coverage to verify the new compact pre-reveal evidence state and the explicit preview flow
- `scripts/playwright/stage61_study_pre_reveal_evidence_minimization_edge.mjs`
  - adds the repo-owned Windows Edge harness for the fresh Stage 61 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage61-home-landing-desktop.png`
- `output/playwright/stage61-graph-browse-desktop.png`
- `output/playwright/stage61-study-browse-desktop.png`
- `output/playwright/stage61-focused-study-desktop.png`
- `output/playwright/stage61-study-pre-reveal-validation.json`

## Outcome
- Stage 61 is complete.
- The fresh Stage 61 captures show a materially calmer Study browse surface: the queue rail now reads like lighter utility, and pre-reveal evidence no longer competes with the main quiz flow. Home and Graph stay stable, and focused Study preserves the reader-led split.
- The next step is Stage 62 `Post-Stage-61 Benchmark Audit` so the next implementation slice is chosen from fresh benchmark evidence rather than from momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage61_study_pre_reveal_evidence_minimization_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite still stalls as one whole-file run, so targeted Vitest coverage plus the real Edge capture remains the trusted validation path here.
