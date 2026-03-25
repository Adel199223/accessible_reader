# ExecPlan: Stage 532 Post-Stage-531 Reader Dock Tray Demotion And Glance-Note Retirement Audit

## Summary
- Audit the Stage 531 original-only `Reader` dock-tray demotion and glance-note retirement reset against the current Recall reading-first benchmark direction.
- Confirm that wide-desktop original-only `Reader` now keeps the attached support rail calmer without reopening generated-content work.
- Keep `Home` and `Graph` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Home`
  - `Graph`
- Supporting Reader crops:
  - original-only deck join and tray seam
  - original-only dock lower edge and tray height
  - original-only article lead and top-of-deck continuity

## Acceptance
- The audit states clearly whether Stage 531 materially reduced the remaining original-only Reader support-rail mismatch against Recall's current reading direction.
- The audit records whether the dock now reads more like a calmer attached tray instead of a full-height companion column.
- The audit records whether the default duplicated glance note was successfully retired without harming capture or source continuity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 531/532 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Complete.
- The Stage 532 audit confirmed that Stage 531 materially reduced the remaining original-only `Reader` support-rail mismatch: the deck now keeps the tray attached while giving the article clearer first-screen dominance.
- `Home` and `Graph` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold instead of auto-opening another product slice.

## Evidence
- Real Windows Edge Stage 532 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage532-home-wide-top.png`
  - `output/playwright/stage532-graph-wide-top.png`
  - `output/playwright/stage532-reader-original-wide-top.png`
  - `output/playwright/stage532-reader-deck-join-wide-top.png`
  - `output/playwright/stage532-reader-article-lead-wide-top.png`
  - `output/playwright/stage532-reader-dock-tray-wide-top.png`
- Live Reader tray metrics in Edge:
  - `stageGlanceNoteVisible: false`
  - `24.46px` stage-glance seam
  - `339.93px` dock height against `742px` article height for a `0.46` dock-to-article height ratio
  - retained `0px` deck gap, `0px` document-shell inset, `12px` article/dock seam radii, `-2.23px` article-to-dock gap, and `2.23px` seam overlap
  - `882.73px` article width, `226.24px` dock width, and a `3.9` article-to-dock ratio
- Validation remained green:
  - `node --check` for the Stage 531/532 harness pair
  - real Windows Edge Stage 531 and Stage 532 runs
  - `Home`, `Graph`, and `/reader` live localhost `200` checks
  - targeted Vitest, `npm run lint`, `npm run build`, and `git diff --check`

## Next Recommendation
- Do not auto-open another top-level slice from this checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold unless the user explicitly resumes product work or a direct regression forces a correction.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
