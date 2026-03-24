# ExecPlan: Stage 501 Post-Stage-500 Home Organizer Overview And Grouped Board Audit

## Summary
- Audit the Stage 500 `Home` organizer-overview and grouped-board deflation reset against Recall's current organized-library direction.
- Confirm that the organizer overview/reset row now feels like a real overview lens and that the grouped board reads calmer above the fold.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - organizer overview/reset row
  - grouped overview header
  - grouped overview board
  - selected branch follow-through after leaving overview

## Acceptance
- The audit states clearly whether Stage 500 materially reduced the remaining mismatch between Recall's current `Home` benchmark and our overview/reset workspace.
- The audit records whether the organizer overview/reset row reads as a clearer reset target rather than a helper paragraph.
- The audit records whether the grouped overview board is calmer and less boxed without losing drill-in clarity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 500/501 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 500 succeeded overall: wide desktop `Home` is materially closer to Recall's current organizer-owned overview direction than the Stage 499 baseline.
- The organizer overview/reset row now reads like a real lens state instead of helper copy. The explicit `OVERVIEW` state on `All collections` and the paired `RESET` affordance on a selected branch make the organizer feel more deliberate.
- The grouped overview board is calmer above the fold. `Collections overview` now behaves more like a utility header, and the grouped cards feel less boxed without losing drill-in clarity.
- `Graph` stayed visually stable, and original-only `Reader` stayed stable after correcting the audit harness back to an asserted `Original` tab selection.

## Evidence
- Refreshed wide desktop captures:
  - `output/playwright/stage501-home-wide-top.png`
  - `output/playwright/stage501-home-organizer-overview-row-wide-top.png`
  - `output/playwright/stage501-home-grouped-overview-board-wide-top.png`
  - `output/playwright/stage501-home-selected-group-wide-top.png`
  - `output/playwright/stage501-graph-wide-top.png`
  - `output/playwright/stage501-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling from the overview row into `Captures`, where the selected branch still presented a visible `RESET` target instead of reopening a detached shelf.
- The corrected audit harness now verifies `Original` as a tab-level selected state before capturing the Reader regression surface, keeping generated-content Reader work explicitly out of scope.

## Next Recommendation
- Stay on `Home` for the next bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch is now the organizer header/control stack: the `Collections` intro copy, search/filter/sort cluster, and upper utility deck still carry more helper weight and vertical stacking than Recall's leaner left rail.
- Open a new Home ExecPlan from this post-Stage-501 baseline, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
