# ExecPlan: Stage 518 Post-Stage-517 Home Selected-Group Card Title And Shell Audit

## Summary
- Audit the Stage 517 `Home` selected-group card title emphasis and shell continuity deflation reset against Recall's current organized-library direction.
- Confirm that the selected-group cards now feel less boxed and less title-heavy without losing clarity.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group first-row card shell treatment
  - selected-group first-row title treatment
  - selected-group follow-through after the lighter card-shell treatment

## Acceptance
- The audit states clearly whether Stage 517 materially reduced the remaining selected-group card title and shell mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether the selected-group cards now feel less boxed without losing source clarity.
- The audit records whether the card title now reads more like part of one calm row instead of a miniature heading panel.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 517/518 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 518 confirms that Stage 517 materially reduced the remaining selected-group card title and shell mismatch between the current Recall `Home` benchmark and our local board.
- The selected-group cards now feel less boxed without losing source clarity:
  - the dedicated shell crop shows a lighter, calmer card container that no longer reads like a heavy standalone tile
  - the live `Captures` drill-in still keeps the quiet `Paste` hint, explicit title, and compact metadata seam easy to scan at first glance
- The card title now reads more like part of one calm row instead of a miniature heading panel:
  - the dedicated title crop now shows the title sitting closer to the shell and metadata rhythm instead of carrying its own boxed-heading feel
  - the first visible card starts faster and no longer burns as much visual weight on title framing before the content identity is clear
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
- Stage 518 audit harness:
  - `output/playwright/stage518-post-stage517-home-selected-group-card-title-and-shell-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage518-home-wide-top.png`
  - `output/playwright/stage518-home-selected-group-card-shell-wide-top.png`
  - `output/playwright/stage518-home-selected-group-card-title-wide-top.png`
  - `output/playwright/stage518-home-selected-group-wide-top.png`
  - `output/playwright/stage518-graph-wide-top.png`
  - `output/playwright/stage518-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling into `Captures`, keeping the selected-group board dominant, and holding the lighter title-and-shell treatment through the visible board run.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted out of title and shell emphasis and into card gutter plus board-grid continuity:
  - the selected-group board still reads a little more tiled than Recall's leanest grouped-board rows because the card gutters and per-card boundaries keep the field segmented
  - the first visible row would benefit from calmer column and row handoff so the board reads more like one continuous results sheet
- Open a new Home ExecPlan from this post-Stage-518 audit baseline around selected-group card gutter and board-grid continuity deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
