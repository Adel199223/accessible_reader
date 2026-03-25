# ExecPlan: Stage 527 Reader Source-Workspace Strip And Stage-Glance Deflation Reset After Stage 526

## Summary
- Reopen original-only `Reader` from the post-Stage-526 baseline as the next bounded Recall-parity slice.
- Reduce the remaining wide-desktop Reader mismatch by flattening the source-workspace strip and the Reader stage-glance seam so the article starts earlier and the entry chrome reads less like stacked prefaces.
- Keep generated-content Reader work completely out of scope: no `Reflowed`, `Simplified`, or `Summary` workflow changes, no transform logic changes, and no mode-routing changes.

## Scope
- Rework original-only `Reader` in `frontend/src/components/ReaderWorkspace.tsx`, `frontend/src/components/SourceWorkspaceFrame.tsx`, and `frontend/src/index.css`.
- Keep the original article more obviously primary by compressing the pre-reading stack:
  - flatten the Reader-active source-workspace strip and tab row
  - tighten the Reader heading, summary, and utility seam where it still reads like a separate intro block
  - reduce the stage-glance note and metadata seam so the article lane begins earlier above the fold
- Preserve current original-only behaviors:
  - `/reader` route compatibility
  - browser-native read aloud
  - sentence highlighting
  - anchored note capture and reopen
  - source-library access
  - Recall shell handoff into Notes, Graph, and Study
- Keep `Home` and `Graph` as regression surfaces only during this stage.

## Guardrails
- Do not touch generated-content Reader workflows anywhere in this stage.
- Keep Reader original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Do not widen into `Home`, `Graph`, `Notes`, `Study`, or backend implementation work unless a tiny shared-shell adjustment is required for the Reader reset to read correctly.
- Avoid micro-stage churn: make one broader original-only Reader entry-seam correction around source-strip compression and stage-glance deflation rather than reopening another chain of smaller trims.

## Acceptance
- Wide-desktop original-only `Reader` starts the article sooner and keeps the entry chrome calmer above the fold.
- The Reader-active source-workspace strip feels slimmer and less like a separate preface while preserving tab handoffs into the surrounding Recall workspace.
- The stage-glance seam feels lighter and more attached to the reading deck instead of behaving like another content band above the article.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 527/528 harness pair
- live localhost GET checks for `/reader`, `/recall`, and `/recall?section=graph`
- real Windows Edge Stage 527 run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 527 completed the bounded original-only `Reader` entry-seam reset without touching generated-content workflows.
- The source-workspace strip and pre-article seam now feel slimmer and calmer:
  - the Reader-active source-workspace strip retired the redundant original-view chip, shortened the shell description, and compressed the header plus tab seam into a tighter lead-in
  - the live Edge validation harness recorded a `104.63px` Reader-active source-workspace height, `3` visible source-workspace summary chips, a `31.81px` stage-glance seam, a `231.15px` stage-to-article offset, and a `350.18px` source-workspace-to-article offset
  - the original article shell now begins materially earlier above the fold, moving from the Stage 526 `520.41px` article top to `452.4px` while keeping the dock attached at `224px`
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/App.test.tsx src/components/ReaderSurface.test.tsx"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Harness validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage527_reader_source_workspace_strip_and_stage_glance_deflation_reset_after_stage526.mjs && node --check scripts/playwright/stage528_post_stage527_reader_source_workspace_strip_and_stage_glance_audit.mjs"`
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/reader`
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
- Stage 527 validation harness:
  - `output/playwright/stage527-reader-source-workspace-strip-and-stage-glance-deflation-reset-after-stage526-validation.json`
- Refreshed Stage 527 Reader captures:
  - `output/playwright/stage527-reader-original-wide-top.png`
  - `output/playwright/stage527-reader-source-workspace-wide-top.png`
  - `output/playwright/stage527-reader-entry-seam-wide-top.png`
  - `output/playwright/stage527-reader-article-start-wide-top.png`
- The validation ran in real Windows Edge with `runtimeBrowser: "msedge"`.
- `git diff --check`

## Next Recommendation
- Stage 528 should immediately audit this Reader reset instead of auto-opening another top-level surface.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
