# ExecPlan: Stage 505 Post-Stage-504 Home Organizer Utility Button And Branch List Audit

## Summary
- Audit the Stage 504 `Home` organizer utility-button and branch-list deflation reset against Recall's current organized-library direction.
- Confirm that the organizer utilities now read like part of the same compact rail surface and that the selected branch beneath them feels flatter and denser.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - organizer search plus utility/control seam
  - selected branch list in the organizer rail
  - selected branch follow-through after the flatter organizer list

## Acceptance
- The audit states clearly whether Stage 504 materially reduced the remaining utility-seam and selected-branch density mismatch between Recall's current `Home` benchmark and our organizer rail.
- The audit records whether the organizer utility actions now feel integrated instead of detached.
- The audit records whether the selected branch feels denser and less carded without losing clarity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 504/505 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 505 confirms that Stage 504 materially reduced the remaining organizer utility-seam and selected-branch density mismatch between the current Recall `Home` benchmark and our local organizer rail.
- The organizer utility actions now read like one integrated control-surface cluster instead of a detached seam below search:
  - `New`, `Collapse`, and `Hide rail` now share one calmer pill row directly under the search and sort/view controls.
  - The utility row uses the same compact rhythm as the rest of the organizer controls instead of reopening a separate button band.
- The selected branch now feels flatter and denser without losing clarity:
  - the live audit drilled from overview into `Captures`
  - the active branch kept visible preview children (`branchShowsPreviewChildren: true`)
  - source rows now read more like a continuous list beneath the active group instead of short stacked mini-cards
- `Graph` stayed visually stable, and original-only `Reader` stayed stable with the harness explicitly holding the `Original` tab selected.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- Stage 505 audit harness:
  - `output/playwright/stage505-post-stage504-home-organizer-utility-button-and-branch-list-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage505-home-wide-top.png`
  - `output/playwright/stage505-home-organizer-control-deck-wide-top.png`
  - `output/playwright/stage505-home-organizer-utility-cluster-wide-top.png`
  - `output/playwright/stage505-home-organizer-branch-list-wide-top.png`
  - `output/playwright/stage505-home-selected-group-wide-top.png`
  - `output/playwright/stage505-graph-wide-top.png`
  - `output/playwright/stage505-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling from overview into `Captures`, where the flatter utility cluster stayed attached to the organizer rail, the branch kept preview children visible, and the right-side board remained the primary work surface.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted lower in the organizer rail: the top-level group rows, `RESET` / overview readouts, and count badges still carry slightly more boxed emphasis than Recall's leanest continuous organizer list.
- Open a new Home ExecPlan from this post-Stage-505 baseline around organizer group-row and count-badge deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
