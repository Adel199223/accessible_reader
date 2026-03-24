# ExecPlan: Stage 510 Post-Stage-509 Home Organizer Child-Row Metadata And Branch Footer Audit

## Summary
- Audit the Stage 509 `Home` organizer child-row metadata and branch-footer deflation reset against Recall's current organized-library direction.
- Confirm that active-branch child rows now feel lighter and that the `Show all` / `Show fewer` footer no longer reads like a detached pill button.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - active-branch child-row metadata treatment
  - active-branch footer treatment
  - selected branch follow-through after the lighter child-row rhythm

## Acceptance
- The audit states clearly whether Stage 509 materially reduced the remaining child-row metadata and footer mismatch between Recall's current `Home` benchmark and our organizer rail.
- The audit records whether active-branch child rows now feel lighter without losing clarity.
- The audit records whether the `Show all` / `Show fewer` footer now feels more attached to the branch continuation.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 509/510 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 510 confirms that Stage 509 materially reduced the remaining active-branch child-row metadata and organizer-footer mismatch between the current Recall `Home` benchmark and our local organizer rail.
- The active-branch child rows now feel lighter without losing clarity:
  - the live audit kept the `Captures` branch expanded with preview children visible (`branchShowsPreviewChildren: true`)
  - the dedicated child-row crops show the title staying legible while the metadata line and marker no longer read like separate mini-panels
- The organizer-side `Show all` footer now feels attached to the branch continuation instead of a detached pill button:
  - the dedicated footer crop reduced the control to a text-like continuation line rather than a chip
  - the child-row list now ends in one calmer continuation cue that reads like part of the same organizer rhythm
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
- Stage 510 audit harness:
  - `output/playwright/stage510-post-stage509-home-organizer-child-row-metadata-and-branch-footer-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage510-home-wide-top.png`
  - `output/playwright/stage510-home-organizer-child-rows-wide-top.png`
  - `output/playwright/stage510-home-organizer-child-row-wide-top.png`
  - `output/playwright/stage510-home-organizer-branch-footer-wide-top.png`
  - `output/playwright/stage510-home-selected-group-wide-top.png`
  - `output/playwright/stage510-graph-wide-top.png`
  - `output/playwright/stage510-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling into `Captures`, keeping preview children visible, and preserving the right-side board as the primary work surface.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted out of the organizer rail and into the selected-group board itself:
  - the right-side board still ends in a more button-like `Show all 30 captures sources` stop even though the organizer-side footer is now attached and calm
  - the lower edge of the selected-group board still reads slightly more like a detached action than a continuous results sheet
- Open a new Home ExecPlan from this post-Stage-510 audit baseline around selected-group board-footer and lower-sheet continuation deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
