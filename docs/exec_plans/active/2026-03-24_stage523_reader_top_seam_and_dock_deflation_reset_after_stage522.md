# ExecPlan: Stage 523 Reader Top Seam And Dock Deflation Reset After Stage 522

## Summary
- Reopen original-only `Reader` from the post-Stage-522 baseline as the next bounded Recall-parity slice.
- Reduce the remaining wide-desktop Reader mismatch by compressing the top seam and softening the attached dock so the original article lane reads more clearly as the primary surface.
- Keep generated-content Reader work completely out of scope: no `Reflowed`, `Simplified`, or `Summary` workflow changes, no transform logic changes, and no mode-routing changes.

## Scope
- Rework original-only `Reader` in `frontend/src/components/ReaderWorkspace.tsx` and `frontend/src/index.css`.
- Keep the original article more dominant above the fold:
  - shorten original-only top copy where it currently repeats the same intent
  - compress the original-only header, control ribbon, and glance seam
  - widen the original-only article lane relative to the attached dock
- Soften the original-only dock so it reads more like an attached companion than a co-equal side card:
  - calmer dock header and glance block
  - tighter source and notes tab presentation
  - lighter embedded library framing where practical without removing it
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
- Avoid micro-stage churn: make one broader original-only Reader hierarchy correction around chrome compression and dock weight rather than reopening another chain of tiny trims.

## Acceptance
- Wide-desktop original-only `Reader` starts the article higher and reads more like a reading-first workspace.
- The original-only dock feels lighter and more attached without losing source-library or note adjacency.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 523/524 harness pair
- live localhost GET checks for `/reader`, `/recall`, and `/recall?section=graph`
- real Windows Edge Stage 523 run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 523 completed the bounded original-only `Reader` reset without touching generated-content workflows.
- The original article now starts sooner and reads more like the primary workspace:
  - original-only top copy, stage spacing, control ribbon density, and transport sizing all compressed together instead of reopening a chain of smaller trims
  - the live Edge validation harness recorded a `858.9px 236px` reading-deck split, an `838.75px` article lane, a `236px` dock, a `3.55` article-to-dock width ratio, a `278.81px` top seam, and a `48px` primary transport control
- The dock now feels lighter and more attached without losing continuity:
  - original-only dock copy, header, glance framing, tabs, and embedded library shell all softened together
  - source continuity and notes-tab continuity both stayed available in the live Edge capture set
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
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage523_reader_top_seam_and_dock_deflation_reset_after_stage522.mjs && node --check scripts/playwright/stage524_post_stage523_reader_top_seam_and_dock_audit.mjs"`
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/reader`
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
- Stage 523 validation harness:
  - `output/playwright/stage523-reader-top-seam-and-dock-deflation-reset-after-stage522-validation.json`
- Refreshed Stage 523 Reader captures:
  - `output/playwright/stage523-reader-original-wide-top.png`
  - `output/playwright/stage523-reader-top-seam-wide-top.png`
  - `output/playwright/stage523-reader-article-lane-wide-top.png`
  - `output/playwright/stage523-reader-support-dock-wide-top.png`
  - `output/playwright/stage523-reader-dock-notes-wide-top.png`
- The validation ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Stage 524 immediately audited this Reader reset, so do not auto-open another top-level slice from this implementation checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the completed Stage 524 audit unless the user explicitly resumes product work or a direct regression appears.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
