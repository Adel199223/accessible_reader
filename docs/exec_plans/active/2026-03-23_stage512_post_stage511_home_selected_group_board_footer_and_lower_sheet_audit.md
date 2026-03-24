# ExecPlan: Stage 512 Post-Stage-511 Home Selected-Group Board Footer And Lower-Sheet Audit

## Summary
- Audit the Stage 511 `Home` selected-group board footer and lower-sheet continuation deflation reset against Recall's current organized-library direction.
- Confirm that the right-side selected-group board footer now feels more attached to the results sheet and that the lower edge no longer ends in a detached pill-like stop.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group board footer treatment
  - selected-group lower-sheet continuation
  - selected-group follow-through after the calmer footer treatment

## Acceptance
- The audit states clearly whether Stage 511 materially reduced the remaining selected-group board-footer and lower-sheet mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether the selected-group board footer now feels more attached without losing clarity.
- The audit records whether the lower edge of the selected-group board now reads more like continuous results-sheet continuation.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 511/512 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 512 confirms that Stage 511 materially reduced the remaining selected-group board-footer and lower-sheet mismatch between the current Recall `Home` benchmark and our local board.
- The selected-group board footer now feels more attached without losing clarity:
  - the dedicated footer crop reduced the lower `Show all` control to a text-like continuation line instead of a detached pill chip
  - the full selected-group board now ends in a calmer attached stop that reads like part of the same sheet
- The lower edge of the selected-group board now reads more like continuous results-sheet continuation:
  - the dedicated lower-sheet crop keeps the cards, footer, and board edge in one calmer vertical rhythm
  - the board still preserves explicit expansion and the `Captures` result count without reviving heavier footer chrome
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
- Stage 512 audit harness:
  - `output/playwright/stage512-post-stage511-home-selected-group-board-footer-and-lower-sheet-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage512-home-wide-top.png`
  - `output/playwright/stage512-home-selected-group-board-footer-wide-top.png`
  - `output/playwright/stage512-home-selected-group-board-lower-sheet-wide-top.png`
  - `output/playwright/stage512-home-selected-group-wide-top.png`
  - `output/playwright/stage512-graph-wide-top.png`
  - `output/playwright/stage512-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling into `Captures`, keeping the selected-group board dominant, and preserving the explicit board footer affordance while calming its treatment.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted upward inside the selected-group board header:
  - the summary copy under `Captures` still spends slightly more vertical weight than Recall's leanest grouped board headers
  - the top-right count readout still feels a little more detached from the header cluster than the calmer board body beneath it
- Open a new Home ExecPlan from this post-Stage-512 audit baseline around selected-group header summary and count-seam deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
