# ExecPlan: Stage 574 Post-Stage-573 Home Preview-Led Card Proportion And Quieter Selected-Row Support Audit

## Summary
- Audit the Stage 573 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the selected-row support seam is now quieter and that the poster owns more of the board-card height without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - closed toolbar cluster
  - open sort popover
  - left collection rail at rest
  - `Add Content` tile
  - representative `paste` card
  - representative `web` card
  - representative file/document card

## Acceptance
- The audit states clearly whether Stage 573 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the active selected-row support seam now reads as short continuation copy rather than a descriptive helper sentence.
- The audit records whether the poster now owns a larger share of each board card while source-aware variants remain intact.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 573/574 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 573/574 files

## Outcome
- Complete.
- The audit confirmed that Stage 573 improved the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: the selected-collection rail plus day-grouped canvas stayed intact, the active selected-row support seam now reads as compact continuation copy, and the poster now owns more of the board-card height while the lower body stays quieter.
- Live Stage 574 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text with a compact `14`-character length, a `215.19px` add-tile height versus the Stage 572 `225.59px` baseline, `0` visible board-card date nodes, a `0.64` preview-to-card height ratio for the representative `paste` card, a preserved `182px` sort-popover width, `127.0.0.1` as the representative `web` source row, and `at_tariq_86_pronoun_research_v3.html` as the representative file/document source row.
- `Graph` and original-only `Reader` refreshed without a new blocker, and the original-only Reader regression again reopened successfully from Home with `Stage13 Debug 1773482318378` as the audited source title.
