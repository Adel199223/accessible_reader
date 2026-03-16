# ExecPlan: Stage 69 Recall Study Session Dock Summary Reduction And Grounding Ready Compression

## Summary
- Completed the bounded Stage 69 Study browse-mode support-chrome pass identified by the Stage 68 benchmark audit.
- Trimmed the collapsed Study session dock summary and compressed the pre-reveal `Grounding ready` strip so both behave more like quiet utility than like secondary cards.
- Kept Home, Graph, and focused reader-led Study stable while refreshing the targeted and broad frontend assertions around the calmer Study surface.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - collapsed browse-mode Study now drops the total-card and review-log chrome from the dock glance and keeps only the active prompt, due context, and a compact due/new overview
  - the pre-reveal grounding strip now uses a shorter evidence summary plus shorter visible `Preview` and `Reader` utilities while preserving the existing accessible labels and Reader reopen behavior
- `frontend/src/index.css`
  - further softens the collapsed Study dock glance by removing the old metrics-row treatment and tightening the remaining summary spacing
  - restyles the pre-reveal grounding strip into a slimmer inline utility row with lighter actions so it no longer reads like a separate footer card
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extends Study browse assertions to confirm that the collapsed queue summary no longer shows total-card/review-log chrome and that the pre-reveal strip no longer renders the old `Source chunk` chip
  - replaces date-sensitive Home grouping assumptions with stable resume/reopen section assertions so the targeted suite does not drift as the calendar moves
- `frontend/src/App.test.tsx`
  - refreshes the broad integration expectations so whole-file shell coverage stays aligned with the lighter Study queue summary and calmer grounding strip
- `scripts/playwright/stage69_study_dock_summary_reduction_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 69 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage69-home-landing-desktop.png`
- `output/playwright/stage69-graph-browse-desktop.png`
- `output/playwright/stage69-study-browse-desktop.png`
- `output/playwright/stage69-focused-study-desktop.png`
- `output/playwright/stage69-study-dock-summary-reduction-validation.json`

## Outcome
- Stage 69 is complete.
- The fresh Stage 69 captures show a materially calmer Study browse surface:
  - the collapsed dock now reads more like a quiet next-card cue than like a mini dashboard
  - the pre-reveal grounding strip now sits as a low-emphasis inline utility row instead of a second footer card
- Home, Graph, and focused Study stayed stable.
- The next step is Stage 70 `Post-Stage-69 Benchmark Audit` so the next bounded surface pass is chosen from fresh benchmark evidence rather than implementation momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage69_study_dock_summary_reduction_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite and the targeted `RecallWorkspace.stage37` suite were both part of Stage 69 validation, and the older Home grouping assertions are now resilient to date drift.
