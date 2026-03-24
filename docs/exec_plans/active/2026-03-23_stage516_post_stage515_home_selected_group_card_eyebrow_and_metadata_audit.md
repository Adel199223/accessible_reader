# ExecPlan: Stage 516 Post-Stage-515 Home Selected-Group Card Eyebrow And Metadata Audit

## Summary
- Audit the Stage 515 `Home` selected-group card eyebrow and metadata density deflation reset against Recall's current organized-library direction.
- Confirm that the selected-group cards now read lighter at first glance without losing source identity or working-state clarity.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group first-row card treatment
  - selected-group card metadata treatment
  - selected-group follow-through after the lighter card-row treatment

## Acceptance
- The audit states clearly whether Stage 515 materially reduced the remaining selected-group card eyebrow and metadata mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether the selected-group cards now feel lighter without losing clarity.
- The audit records whether the metadata no longer reads like a stacked mini panel inside each card.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 515/516 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 516 confirms that Stage 515 materially reduced the remaining selected-group card eyebrow and metadata mismatch between the current Recall `Home` benchmark and our local board.
- The selected-group cards now feel lighter without losing clarity:
  - the dedicated first-card and eyebrow crops keep `Paste` visible as a quiet source-type hint instead of a dominant label above the title
  - the live `Captures` drill-in still starts on a clear title-led card row, so source identity and working-state context stay easy to scan
- The metadata no longer reads like a stacked mini panel inside each card:
  - the dedicated metadata crop now shows one compact line, `Mar 13 - 2 views`, instead of spending separate rows on local-source and readiness copy
  - the first visible card no longer burns extra height on redundant `Local paste` / `Updated` / `views ready` scaffolding
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
- Stage 516 audit harness:
  - `output/playwright/stage516-post-stage515-home-selected-group-card-eyebrow-and-metadata-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage516-home-wide-top.png`
  - `output/playwright/stage516-home-selected-group-card-wide-top.png`
  - `output/playwright/stage516-home-selected-group-card-eyebrow-wide-top.png`
  - `output/playwright/stage516-home-selected-group-card-metadata-wide-top.png`
  - `output/playwright/stage516-home-selected-group-wide-top.png`
  - `output/playwright/stage516-graph-wide-top.png`
  - `output/playwright/stage516-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling into `Captures`, keeping the selected-group board dominant, and holding the lighter first-card treatment through the visible board run.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted out of eyebrow and metadata density and into card title plus shell emphasis:
  - the selected-group cards still read a little more boxed and title-heavy than Recall's leanest grouped-board rows
  - the first visible card rhythm still carries slightly more shell weight than the calmer organizer, header, and metadata seams now surrounding it
- Open a new Home ExecPlan from this post-Stage-516 audit baseline around selected-group card title emphasis and shell continuity deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
