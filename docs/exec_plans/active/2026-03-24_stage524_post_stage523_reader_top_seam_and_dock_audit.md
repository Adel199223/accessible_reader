# ExecPlan: Stage 524 Post-Stage-523 Reader Top Seam And Dock Audit

## Summary
- Audit the Stage 523 original-only `Reader` top-seam and dock deflation reset against the current Recall reading-first benchmark direction.
- Confirm that wide-desktop original-only `Reader` now starts the article sooner and holds a calmer attached dock without reopening generated-content work.
- Keep `Home` and `Graph` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Home`
  - `Graph`
- Supporting Reader crops:
  - compressed top seam
  - dominant article lane
  - attached dock and source-library continuation

## Acceptance
- The audit states clearly whether Stage 523 materially reduced the remaining original-only Reader chrome-and-dock mismatch against Recall’s current reading direction.
- The audit records whether the original article now starts sooner and reads more dominant above the fold.
- The audit records whether the dock now feels lighter and more attached without losing note or source continuity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 523/524 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 524 confirms that Stage 523 materially reduced the remaining original-only Reader chrome-and-dock mismatch against Recall's current reading-first direction.
- The original article now starts sooner and reads more dominant above the fold:
  - the wide Reader audit recorded a `858.9px 236px` reading-deck split, an `838.75px` article lane, and a `3.55` article-to-dock width ratio in live Edge
  - the top seam held at `278.81px` with a `48px` primary transport control, which keeps the original-only control stack visibly calmer than the earlier oversized transport seam
- The dock now feels lighter and more attached without losing source or note continuity:
  - the source-state dock crop kept active-source and source-library continuation in one lighter attached column
  - the notes-state dock crop kept note continuity reachable without widening back into a co-equal destination rail
- `Home` and `Graph` refreshed in real Windows Edge without surfacing a new blocker.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Harness validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage523_reader_top_seam_and_dock_deflation_reset_after_stage522.mjs && node --check scripts/playwright/stage524_post_stage523_reader_top_seam_and_dock_audit.mjs"`
- Stage 524 audit harness:
  - `output/playwright/stage524-post-stage523-reader-top-seam-and-dock-audit-validation.json`
- Refreshed wide desktop audit captures:
  - `output/playwright/stage524-home-wide-top.png`
  - `output/playwright/stage524-graph-wide-top.png`
  - `output/playwright/stage524-reader-original-wide-top.png`
  - `output/playwright/stage524-reader-top-seam-wide-top.png`
  - `output/playwright/stage524-reader-article-lane-wide-top.png`
  - `output/playwright/stage524-reader-support-dock-wide-top.png`
  - `output/playwright/stage524-reader-dock-notes-wide-top.png`
- Supporting Stage 523 validation evidence:
  - `output/playwright/stage523-reader-top-seam-and-dock-deflation-reset-after-stage522-validation.json`
- `git diff --check`
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Do not auto-open another top-level slice from this checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold until the user explicitly resumes product work or a direct regression forces a correction.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
