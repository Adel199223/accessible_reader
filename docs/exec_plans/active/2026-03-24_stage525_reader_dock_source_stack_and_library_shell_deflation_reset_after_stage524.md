# ExecPlan: Stage 525 Reader Dock Source-Stack And Library-Shell Deflation Reset After Stage 524

## Summary
- Reopen original-only `Reader` from the post-Stage-524 baseline as the next bounded Recall-parity slice.
- Reduce the remaining wide-desktop Reader mismatch by flattening the dock source stack and embedded library shell so the right rail reads more like a thin companion rail than a second panel.
- Keep generated-content Reader work completely out of scope: no `Reflowed`, `Simplified`, or `Summary` workflow changes, no transform logic changes, and no mode-routing changes.

## Scope
- Rework original-only `Reader` in `frontend/src/components/ReaderWorkspace.tsx` and `frontend/src/index.css`.
- Keep the original article more obviously primary by further demoting dock chrome:
  - flatten the original-only dock header and summary seam
  - soften dock metadata and tabs where they still read like separate controls
  - turn the source glance plus embedded library stack into a calmer continuous source-support column
- Optionally tighten the original-only dock width modestly if the dock remains usable for source switching and notes continuity after the flattening pass.
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
- Avoid micro-stage churn: make one broader original-only Reader dock correction around source-stack flattening and embedded-library deflation rather than reopening another chain of smaller trims.

## Acceptance
- Wide-desktop original-only `Reader` keeps the article lane clearly primary while the dock reads more like attached companion support.
- The source glance and source library feel more continuous and less panel-like without losing source switching.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 525/526 harness pair
- live localhost GET checks for `/reader`, `/recall`, and `/recall?section=graph`
- real Windows Edge Stage 525 run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 525 completed the bounded original-only `Reader` dock reset without touching generated-content workflows.
- The source-support rail now feels thinner and more attached:
  - the original-only dock header, metadata, tabs, source glance, embedded library shell, and notes-toolbar copy all compressed together instead of reopening a chain of smaller trims
  - the live Edge validation harness recorded a `872.175px 224px` reading-deck split, an `852.03px` article lane, a `224px` dock, a `3.8` article-to-dock width ratio, a `115.47px` dock-header height, a `118.71px` source-glance block, a `39.16px` embedded-library shell, a `5.44px` source-stack gap, and `0px` library-shell padding
- Source switching and notes continuity stayed intact inside the calmer rail:
  - the source-stack crop kept the active source plus source-library continuity inside one slimmer column
  - the notes-state dock crop stayed usable after the dock flattening pass without widening back into a co-equal side panel
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
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage525_reader_dock_source_stack_and_library_shell_deflation_reset_after_stage524.mjs && node --check scripts/playwright/stage526_post_stage525_reader_dock_source_stack_and_library_shell_audit.mjs"`
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/reader`
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
- Stage 525 validation harness:
  - `output/playwright/stage525-reader-dock-source-stack-and-library-shell-deflation-reset-after-stage524-validation.json`
- Refreshed Stage 525 Reader captures:
  - `output/playwright/stage525-reader-original-wide-top.png`
  - `output/playwright/stage525-reader-dock-header-wide-top.png`
  - `output/playwright/stage525-reader-source-stack-wide-top.png`
  - `output/playwright/stage525-reader-dock-notes-wide-top.png`
- The validation ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stage 526 immediately audited this Reader reset, so do not auto-open another top-level slice from this implementation checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the completed Stage 526 audit unless the user explicitly resumes product work or a direct regression appears.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
