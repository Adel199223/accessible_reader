# ExecPlan: Stage 526 Post-Stage-525 Reader Dock Source-Stack And Library-Shell Audit

## Summary
- Audit the Stage 525 original-only `Reader` dock source-stack and library-shell deflation reset against the current Recall reading-first benchmark direction.
- Confirm that wide-desktop original-only `Reader` now keeps the source-support rail calmer and thinner without reopening generated-content work.
- Keep `Home` and `Graph` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Home`
  - `Graph`
- Supporting Reader crops:
  - original-only dock header and tabs seam
  - original-only source-support stack and library continuity
  - original-only notes-state dock continuity

## Acceptance
- The audit states clearly whether Stage 525 materially reduced the remaining original-only Reader dock-source-stack mismatch against Recall’s current reading direction.
- The audit records whether the source-support rail now feels thinner and more attached without losing source-library access.
- The audit records whether the notes-state dock still stays usable after the source-stack flattening pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 525/526 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 526 confirms that Stage 525 materially reduced the remaining original-only Reader dock-source-stack mismatch against Recall's current reading-first direction.
- The source-support rail now feels thinner and more attached without losing source-library access:
  - the wide Reader audit recorded a `872.175px 224px` reading-deck split, an `852.03px` article lane, a `224px` dock, and a `3.8` article-to-dock width ratio in live Edge
  - the dock header held at `115.47px`, the source-glance block held at `118.71px`, the embedded-library shell held at `39.16px`, the source-stack gap held at `5.44px`, and the embedded library kept `0px` top padding, which together read more like one thin support rail than a stacked side panel
- The notes-state dock still stayed usable after the source-stack flattening pass:
  - the notes-state crop kept saved-note continuity reachable without widening the dock back into a co-equal destination rail
- `Home` and `Graph` refreshed in real Windows Edge without surfacing a new blocker.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Harness validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage525_reader_dock_source_stack_and_library_shell_deflation_reset_after_stage524.mjs && node --check scripts/playwright/stage526_post_stage525_reader_dock_source_stack_and_library_shell_audit.mjs"`
- Stage 526 audit harness:
  - `output/playwright/stage526-post-stage525-reader-dock-source-stack-and-library-shell-audit-validation.json`
- Refreshed wide desktop audit captures:
  - `output/playwright/stage526-home-wide-top.png`
  - `output/playwright/stage526-graph-wide-top.png`
  - `output/playwright/stage526-reader-original-wide-top.png`
  - `output/playwright/stage526-reader-dock-header-wide-top.png`
  - `output/playwright/stage526-reader-source-stack-wide-top.png`
  - `output/playwright/stage526-reader-dock-notes-wide-top.png`
- Supporting Stage 525 validation evidence:
  - `output/playwright/stage525-reader-dock-source-stack-and-library-shell-deflation-reset-after-stage524-validation.json`
- `git diff --check`
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Do not auto-open another top-level slice from this checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold until the user explicitly resumes product work or a direct regression forces a correction.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
