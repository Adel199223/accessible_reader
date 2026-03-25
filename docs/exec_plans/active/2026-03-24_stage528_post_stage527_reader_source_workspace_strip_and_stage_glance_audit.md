# ExecPlan: Stage 528 Post-Stage-527 Reader Source-Workspace Strip And Stage-Glance Audit

## Summary
- Audit the Stage 527 original-only `Reader` source-workspace strip and stage-glance deflation reset against the current Recall reading-first benchmark direction.
- Confirm that wide-desktop original-only `Reader` now reaches the article sooner and keeps the entry seam calmer without reopening generated-content work.
- Keep `Home` and `Graph` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Home`
  - `Graph`
- Supporting Reader crops:
  - Reader-active source-workspace strip
  - compressed Reader entry seam above the article
  - original-only article start and dock continuity

## Acceptance
- The audit states clearly whether Stage 527 materially reduced the remaining original-only Reader entry-chrome mismatch against Recall's current reading direction.
- The audit records whether the Reader-active source-workspace strip now feels slimmer and more attached while preserving the source-workspace tab handoff.
- The audit records whether the article now starts earlier above the fold without losing source, note, or transport continuity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 527/528 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 528 confirms that Stage 527 materially reduced the remaining original-only `Reader` entry-chrome mismatch against Recall's current reading-first direction.
- The Reader-active source-workspace strip now feels slimmer and more attached while preserving tab handoff:
  - the live audit recorded a `104.63px` source-workspace strip, `3` visible source-workspace summary chips, and a calmer one-line description plus tab seam before the reading deck
- The article now starts earlier above the fold without losing dock continuity:
  - the live Reader audit recorded a `452.4px` article top, a `231.15px` stage-to-article offset, a `350.18px` source-workspace-to-article offset, a `31.81px` stage-glance seam, and a `224px` dock that stayed attached alongside the wider `859.06px` article lane
  - compared with Stage 526, the article moved `68.01px` earlier above the fold while keeping the thinner dock treatment intact
- `Home` and `Graph` refreshed in real Windows Edge without surfacing a new blocker.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Harness validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage527_reader_source_workspace_strip_and_stage_glance_deflation_reset_after_stage526.mjs && node --check scripts/playwright/stage528_post_stage527_reader_source_workspace_strip_and_stage_glance_audit.mjs"`
- Stage 528 audit harness:
  - `output/playwright/stage528-post-stage527-reader-source-workspace-strip-and-stage-glance-audit-validation.json`
- Refreshed wide desktop audit captures:
  - `output/playwright/stage528-home-wide-top.png`
  - `output/playwright/stage528-graph-wide-top.png`
  - `output/playwright/stage528-reader-original-wide-top.png`
  - `output/playwright/stage528-reader-source-workspace-wide-top.png`
  - `output/playwright/stage528-reader-entry-seam-wide-top.png`
  - `output/playwright/stage528-reader-article-start-wide-top.png`
- Supporting Stage 527 validation evidence:
  - `output/playwright/stage527-reader-source-workspace-strip-and-stage-glance-deflation-reset-after-stage526-validation.json`
- `git diff --check`
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Do not auto-open another top-level slice from this checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold unless the user explicitly resumes product work or a direct regression forces a correction.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
