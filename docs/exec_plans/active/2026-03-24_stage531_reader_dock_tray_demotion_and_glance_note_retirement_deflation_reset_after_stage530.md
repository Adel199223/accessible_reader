# ExecPlan: Stage 531 Reader Dock Tray Demotion And Glance-Note Retirement Deflation Reset After Stage 530

## Summary
- Reopen original-only `Reader` from the post-Stage-530 baseline as the next bounded Recall-parity slice.
- Reduce the remaining wide-desktop Reader mismatch by demoting the attached support rail into a calmer tray and retiring the duplicated default glance note that still floats above the deck.
- Keep generated-content Reader work completely out of scope: no `Reflowed`, `Simplified`, or `Summary` workflow changes, no transform logic changes, and no mode-routing changes.

## Scope
- Rework original-only `Reader` in `frontend/src/components/ReaderWorkspace.tsx` and `frontend/src/index.css`.
- Keep the original article more obviously primary by calming the post-Stage-530 support treatment:
  - retire the duplicated default original-only glance note when it is only echoing the dock guidance
  - collapse the attached support rail from a full-height article-matched column into a calmer attached tray
  - preserve the attached top seam so the dock still reads as part of the same reading deck instead of drifting back into a detached card
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
- Avoid micro-stage churn: make one broader original-only Reader support-rail correction around dock-tray demotion plus glance-note retirement rather than splitting those into separate passes.

## Acceptance
- Wide-desktop original-only `Reader` gives the article even clearer first-screen dominance by shrinking the attached support rail’s vertical presence.
- The duplicated default glance note no longer floats above the deck when it is only restating the dock guidance.
- The dock remains attached, usable for source switching and notes continuity, and visibly calmer than the Stage 530 full-height rail.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 531/532 harness pair
- live localhost GET checks for `/reader`, `/recall`, and `/recall?section=graph`
- real Windows Edge Stage 531 run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Complete.
- Original-only `Reader` now retires the duplicated default original-view glance note and demotes the attached support rail from a full-height companion column into a calmer attached tray.
- Generated-content `Reader` work stayed fully locked: no `Reflowed`, `Simplified`, `Summary`, transform, placeholder, or mode-routing changes were made anywhere in this pass.

## Evidence
- Product correction in:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
- New Reader-only harness pair:
  - `scripts/playwright/stage531_reader_dock_tray_demotion_and_glance_note_retirement_deflation_reset_after_stage530.mjs`
  - `scripts/playwright/stage532_post_stage531_reader_dock_tray_demotion_and_glance_note_retirement_audit.mjs`
- Real Windows Edge Stage 531 validation against `http://127.0.0.1:8000` recorded:
  - `stageGlanceNoteVisible: false`
  - `24.66px` stage-glance seam
  - `339.93px` dock height against the retained `742px` article height for a `0.46` dock-to-article height ratio
  - retained `0px` deck gap, `0px` document-shell inset, `12px` seam radii, and `2.23px` overlap at the article-to-dock join
  - `882.73px` article width and `226.24px` dock width at a `3.9` article-to-dock ratio
- Supporting captures:
  - `output/playwright/stage531-reader-original-wide-top.png`
  - `output/playwright/stage531-reader-deck-join-wide-top.png`
  - `output/playwright/stage531-reader-article-lead-wide-top.png`
  - `output/playwright/stage531-reader-dock-tray-wide-top.png`

## Next Recommendation
- Stage 532 should immediately audit this Reader support-rail reset instead of auto-opening another top-level surface.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
