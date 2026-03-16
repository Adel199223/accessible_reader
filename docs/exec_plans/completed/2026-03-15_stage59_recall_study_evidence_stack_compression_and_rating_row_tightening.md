# ExecPlan: Stage 59 Recall Study Evidence Stack Compression And Rating Row Tightening

## Summary
- Completed the bounded Stage 59 Study lower-stack compression pass identified by the Stage 58 benchmark audit.
- Compressed the browse-mode `Source evidence` block so it reads as lighter grounding support instead of as a second card inside the review card.
- Quieted the browse-mode rating footer by delaying the full rating controls until reveal and by using a smaller post-reveal action row.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - browse-mode Study now uses a compact support-toolbar treatment for `Source evidence` with a smaller Reader reopen action
  - the browse-mode evidence panel is lighter and shorter, with the excerpt and metadata preserved but no heavyweight action row inside the support panel
  - browse mode now shows a quiet `Rate after reveal` placeholder before the answer is revealed, then swaps to a smaller rating row after reveal
  - focused Study keeps the stronger reader-led evidence and rating treatment
- `frontend/src/index.css`
  - adds compact browse-mode Study support-stack, evidence-panel, Reader-button, and rating-row styles
  - reduces lower-card padding, chrome, and support density without changing the preserved focused Study layout
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extends targeted Study browse coverage to verify the quieter pre-reveal rating state and the post-reveal rating controls
- `scripts/playwright/stage59_study_evidence_stack_compression_edge.mjs`
  - adds the repo-owned Windows Edge harness for the fresh Stage 59 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage59-home-landing-desktop.png`
- `output/playwright/stage59-graph-browse-desktop.png`
- `output/playwright/stage59-study-browse-desktop.png`
- `output/playwright/stage59-focused-study-desktop.png`
- `output/playwright/stage59-study-evidence-stack-validation.json`

## Outcome
- Stage 59 is complete.
- The fresh Stage 59 captures show a materially calmer lower Study review stack while Home and Graph stay stable and focused Study preserves the reader-led split.
- The next step is Stage 60 `Post-Stage-59 Benchmark Audit` so the next implementation slice is chosen from fresh benchmark evidence rather than from implementation momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage59_study_evidence_stack_compression_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite still stalls as one whole-file run, so targeted Vitest coverage plus the real Edge capture remains the trusted validation path here.
