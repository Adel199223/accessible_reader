# ExecPlan: Stage 514 Post-Stage-513 Home Selected-Group Header Summary And Count Seam Audit

## Summary
- Audit the Stage 513 `Home` selected-group header summary and count-seam deflation reset against Recall's current organized-library direction.
- Confirm that the selected-group board header now starts faster and that the top-right count readout feels more attached to the heading seam.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group header summary treatment
  - selected-group count seam
  - selected-group follow-through after the calmer header treatment

## Acceptance
- The audit states clearly whether Stage 513 materially reduced the remaining selected-group header summary and count-seam mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether the selected-group header now feels lighter without losing clarity.
- The audit records whether the top-right count readout now feels more attached to the heading seam.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 513/514 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 514 confirms that Stage 513 materially reduced the remaining selected-group header summary and count-seam mismatch between the current Recall `Home` benchmark and our local board.
- The selected-group header now feels lighter without losing clarity:
  - the dedicated header and summary crops keep `Captures` explicit while the helper copy collapses into a shorter bridge that no longer reads like a mini body block above the cards
  - the live selected-group board now starts faster, so the first card row feels closer to the heading seam instead of waiting under a heavier summary stack
- The top-right count readout now feels more attached to the heading seam:
  - the dedicated count crop shows `34 sources` reading as a quiet seam-end label instead of a detached badge
  - the full header crop keeps the label, summary, and count in one calmer strip even though the seeded summary still wraps compactly across multiple lines
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
- Stage 514 audit harness:
  - `output/playwright/stage514-post-stage513-home-selected-group-header-summary-and-count-seam-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage514-home-wide-top.png`
  - `output/playwright/stage514-home-selected-group-header-wide-top.png`
  - `output/playwright/stage514-home-selected-group-header-summary-wide-top.png`
  - `output/playwright/stage514-home-selected-group-header-count-wide-top.png`
  - `output/playwright/stage514-home-selected-group-wide-top.png`
  - `output/playwright/stage514-graph-wide-top.png`
  - `output/playwright/stage514-reader-original-wide-top.png`
- The live Home audit preserved organizer continuity by drilling into `Captures`, keeping the selected-group board dominant, and holding the calmer header plus count seam above the card field.
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stay on `Home` for one more bounded parity slice rather than reopening `Graph` or original-only `Reader`.
- The clearest remaining mismatch has shifted out of the selected-group header seam and into the first visible card row:
  - repeated source-type eyebrows such as `PASTE` still add more label weight than Recall's leanest grouped board cards
  - the card metadata stack still spends a little more vertical space on local-source and update/readiness lines than the calmer header above it
- Open a new Home ExecPlan from this post-Stage-514 audit baseline around selected-group card eyebrow and metadata density deflation, keep `Graph` and original-only `Reader` as regression surfaces, and keep generated-content Reader work explicitly locked.
