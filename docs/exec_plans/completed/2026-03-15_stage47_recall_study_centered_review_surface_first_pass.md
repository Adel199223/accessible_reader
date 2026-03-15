# ExecPlan: Stage 47 Recall Study Centered Review Surface First Pass

## Summary
- Reframed browse-mode Study around a calmer, more centered review/start surface instead of the older dashboard-first layout.
- Kept focused reader-led Study work intact after intentional source entry.
- Preserved local FSRS state, source evidence, and explicit Reader reopen actions while moving the page closer to the Recall benchmark.

## What Landed
- Browse-mode Study now leads with one centered review stage card:
  - `Recall review` is the primary heading
  - the main review loop is explained with a short three-step progression
  - the active review card now reads as the dominant task surface instead of as one panel among many
- Supporting queue chrome is still available, but it is visually demoted into a lighter side rail.
- Browse-mode review detail now uses:
  - a centered review card frame
  - compact metadata chips
  - one focused evidence panel with optional evidence-span switching
  - preserved `Open ... in Reader` handoffs
- Focused Study still preserves the reader-led split so the live source remains visible beside the active card.

## Sources Used
- User-provided Recall spaced-repetition screenshot in this thread
- Official supporting Recall sources:
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)

## Fresh Artifacts
- `output/playwright/stage47-home-landing-desktop.png`
- `output/playwright/stage47-graph-browse-desktop.png`
- `output/playwright/stage47-study-browse-desktop.png`
- `output/playwright/stage47-focused-study-desktop.png`
- `output/playwright/stage47-study-centered-validation.json`

## Findings
- Study browse mode is now materially closer to the Recall benchmark:
  - the review task is centered and visually dominant
  - the queue remains reachable without owning the entire page hierarchy
  - Reader evidence reopen stays nearby without turning the surface back into a dashboard
- Focused Study still preserves the Stage 34 reader-led split behavior.
- Home and Graph remained stable during the Study rewrite.
- The remaining benchmark question is no longer whether Study needed this first pass; it is whether Home density or Study’s remaining queue/sidebar weight is now the higher-value next correction.

## Decision
- Stage 47 is complete.
- The next slice should be a benchmark audit of the live post-Stage-47 surfaces before choosing the next bounded implementation pass.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx eslint src/App.test.tsx src/components/RecallWorkspace.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- targeted `src/App.test.tsx` passes for:
  - `Recall study queue shows an active card and records a review after revealing the answer`
  - `Recall study detail keeps a Reader handoff next to source evidence`
  - `Study filter and targeted card survive Reader handoff and return`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage47_study_centered_review_edge.mjs`

## Known Caveat
- The isolated `source-focused study handoff keeps Reader visible while manual Study browsing reopens filters` check in `frontend/src/App.test.tsx` still falls into the same long-standing whole-file/isolated runner stall pattern rather than producing a concrete assertion failure. The trustworthy signal for this slice remains the targeted component coverage plus the real Edge screenshot harness.
