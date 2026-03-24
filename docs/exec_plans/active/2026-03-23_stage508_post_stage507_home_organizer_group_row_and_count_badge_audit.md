# ExecPlan: Stage 508 Post-Stage-507 Home Organizer Group Row And Count Badge Audit

## Summary
- Audit the Stage 507 `Home` organizer group-row and count-badge deflation reset against Recall's current organized-library direction.
- Confirm that the top-level organizer rows now feel flatter and more continuous and that the overview/reset readouts plus counts no longer read like standalone chips.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - organizer overview/reset row
  - top-level organizer group rows and count badges
  - selected branch follow-through after the lighter row treatment

## Acceptance
- The audit states clearly whether Stage 507 materially reduced the remaining group-row and count-badge mismatch between Recall's current `Home` benchmark and our organizer rail.
- The audit records whether the top-level organizer rows now feel less boxed and more continuous.
- The audit records whether the overview/reset readouts and counts now feel lighter without losing clarity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 507/508 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 508 confirms that Stage 507 materially reduced the remaining organizer group-row and count-badge mismatch between the current Recall `Home` benchmark and our local organizer rail.
- The top-level organizer rows now feel flatter and more continuous instead of lightly boxed mini-panels:
  - the overview row reads like part of the same organizer list language as `Captures`, `Web`, and `Documents`
  - the grouped rail keeps its scan order without reviving heavier panel framing around each top-level branch
- The overview/reset readouts and top-level counts now feel lighter without losing clarity:
  - the live audit kept the overview row visible first, where `OVERVIEW` and the top-level count now read more like attached organizer readouts than standalone chips
  - the live drill-in into `Captures` preserved preview children (`branchShowsPreviewChildren: true`) while the top-level `34` count still read clearly at the lighter weight
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
- Stage 508 audit harness:
  - `output/playwright/stage508-post-stage507-home-organizer-group-row-and-count-badge-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage508-home-wide-top.png`
  - `output/playwright/stage508-home-organizer-overview-row-wide-top.png`
  - `output/playwright/stage508-home-organizer-group-rows-wide-top.png`
  - `output/playwright/stage508-home-organizer-active-group-row-wide-top.png`
  - `output/playwright/stage508-home-selected-group-wide-top.png`
  - `output/playwright/stage508-graph-wide-top.png`
  - `output/playwright/stage508-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by starting in overview, drilling into `Captures`, keeping preview children visible, and preserving the right-side board as the primary work surface.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted lower in the organizer rail: the selected-branch child-row metadata and the `Show all` footer still read slightly heavier than Recall's leanest attached branch list.
- Open a new Home ExecPlan from this post-Stage-508 audit baseline around organizer child-row metadata and active-branch footer deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
