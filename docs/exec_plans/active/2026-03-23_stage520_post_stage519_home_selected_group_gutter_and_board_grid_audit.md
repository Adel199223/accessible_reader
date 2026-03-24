# ExecPlan: Stage 520 Post-Stage-519 Home Selected-Group Gutter And Board-Grid Audit

## Summary
- Audit the Stage 519 `Home` selected-group card gutter and board-grid continuity deflation reset against Recall's current organized-library direction.
- Confirm that the selected-group board now feels less tiled and more like one continuous results sheet without losing scan order.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group board-grid continuity
  - selected-group first-row gutter treatment
  - selected-group follow-through after the calmer board-grid treatment

## Acceptance
- The audit states clearly whether Stage 519 materially reduced the remaining selected-group gutter and board-grid mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether the selected-group board now feels less tiled without losing source clarity.
- The audit records whether the card field now reads more like one calm results sheet instead of a set of separated mini-panels.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 519/520 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 520 confirms that Stage 519 materially reduced the remaining selected-group gutter and board-grid mismatch between the current Recall `Home` benchmark and our local board.
- The selected-group board now feels less tiled without losing source clarity:
  - the dedicated board-grid crop shows the visible `Captures` run sitting inside a calmer shared field where adjacent row boundaries no longer dominate first scan
  - the dedicated gutter crop shows the first two visible cards handing off with much less dead space while keeping the quiet `Paste` hint, explicit title, and compact metadata seam readable
- The card field now reads more like one calm results sheet instead of a set of separated mini-panels:
  - the selected-group follow-through crop shows the visible row continuing across the board without each card breaking into its own isolated island
  - the live `Captures` drill-in still preserves clear source identity and row order while the shared board field stays calmer behind the visible cards
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
- Stage 520 audit harness:
  - `output/playwright/stage520-post-stage519-home-selected-group-gutter-and-board-grid-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage520-home-wide-top.png`
  - `output/playwright/stage520-home-selected-group-board-grid-wide-top.png`
  - `output/playwright/stage520-home-selected-group-card-gutter-wide-top.png`
  - `output/playwright/stage520-home-selected-group-wide-top.png`
  - `output/playwright/stage520-graph-wide-top.png`
  - `output/playwright/stage520-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling into `Captures`, keeping the selected-group board dominant, and holding the softer gutter plus calmer board-grid treatment through the visible board run.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted out of board-grid segmentation and into title-wrap plus row-height continuity:
  - longer selected-group titles still create a slightly jagged lower edge across the visible board row
  - the board would benefit from calmer title wrapping and steadier row-height behavior so adjacent cards read even more like attached results-sheet rows
- Open a new Home ExecPlan from this post-Stage-520 audit baseline around selected-group title-wrap and row-height continuity deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
