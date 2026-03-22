# ExecPlan: Stage 483 Home Manual Organizer Ordering And Selection Reset After Stage 482

## Summary
- Reopen `Home` for the next broad Recall-parity slice after the Stage 482 `Graph` navigation-controls audit.
- Shift the next correction away from board/card density and into the organizer's missing work-mode behavior.
- Make `Home` feel closer to Recall's current tag-tree direction by adding a real manual organizer mode, desktop multi-selection, and a bottom selection bar instead of treating the left panel as a polished but mostly passive filter list.

## Benchmark Basis
- Official Recall organization guidance now treats the left organizer as a working tag tree, not only a browse list:
  - [Tagging](https://docs.getrecall.ai/deep-dives/tagging)
  - [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading position and share cards with a beautiful link preview.](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
- Important benchmark details from those sources:
  - the left panel is a hierarchical tag tree that can contain both tags and cards
  - the panel header owns search/filter, sorting, collapse-all, and sidebar-hide controls
  - manual sorting is a real work mode, not only a visual variant of automatic sort
  - desktop multi-selection uses Ctrl/Cmd-click and exposes a bottom action bar with selection count
  - expand/collapse behavior is part of the organizer workflow, not a secondary detail
- Inference from those sources:
  - because this repo does not yet support full tag CRUD and destructive bulk delete flows, the best bounded parity move is to add a real manual organizer ordering model plus desktop selection and selection-bar behavior around the existing section/card tree, rather than inventing unsupported persistent tag-editing APIs in the same slice.

## Goals
- Add a true manual organizer mode to wide desktop `Home`.
- Let the organizer remember a custom order for top-level groups and branch cards while manual mode is active.
- Add desktop multi-selection behavior inside the organizer with a bottom selection bar.
- Keep the right-side board/list workbench aligned with the organizer's active and manual ordering state.

## Scope

### 1. Add a real manual organizer mode
- Extend the existing sort model with `Manual`.
- When `Manual` is active, stop re-sorting the organizer with automatic timestamp/name logic and instead preserve the user's custom order.
- Keep `Updated`, `Created`, and `A-Z` intact as automatic modes.

### 2. Add manual ordering controls
- Allow top-level organizer groups to move up/down while `Manual` is active.
- Allow source rows within the active organizer branch to move up/down while `Manual` is active.
- Mirror that custom ordering in the right-side selected board and grouped overview so the organizer remains the source of truth.
- Keep this bounded to same-level reordering only; do not implement full tag CRUD or cross-parent moves in this slice.

### 3. Add desktop organizer selection behavior
- Support Ctrl/Cmd-click selection on organizer groups and organizer source rows.
- Keep normal click behavior for drill-in and source-open when modifier keys are not held.
- Support `Escape` to clear organizer selection.
- Show a bottom organizer selection bar with selection count and the most relevant contextual actions available in this bounded model.

### 4. Preserve the existing board/list workbench
- Keep `Collections` and `Recent` lens switching.
- Keep board/list switching, search, collapse-all, and hide organizer behavior.
- Keep the grouped overview default and explicit branch drill-in model from Stage 479, but make the organizer feel more like an active work surface once manual mode or selection is in play.

## Non-Goals
- No generated-content Reader work.
- No `Reflowed`, `Simplified`, or `Summary` changes.
- No Reader generated-view UX, transform logic, placeholders, controls, or mode-routing changes.
- No backend schema or API changes unless a blocker appears. The intended solution is frontend-only.
- No full tag CRUD implementation, destructive bulk delete, inline rename persistence, or nested cross-parent drag/drop authoring in this slice.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Home regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/lib/appRoute.test.ts`
  - `frontend/src/lib/appRoute.ts`
- continuity docs and a new Stage 483/484 harness pair

## Validation Plan
- Targeted Vitest:
  - `src/lib/appRoute.test.ts`
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 483/484 harness pair
- live `GET 200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Expected Evidence
- Stage 483 implementation harness should capture:
  - the default wide `Home` organizer in automatic mode
  - manual mode with custom group ordering visible
  - manual mode with custom source-row ordering inside the active branch
  - the organizer selection bar visible after desktop multi-selection
- Stage 484 audit harness should refresh:
  - `Home`
  - `Graph`
  - original-only `Reader`
- The audit should state clearly whether `Home` now behaves more like an active Recall tag-tree workbench instead of a calmer but still mostly passive organizer filter column.

## Exit Criteria
- `Home` has a real `Manual` organizer mode.
- Top-level groups and active-branch source rows can be custom-ordered in a bounded, understandable way.
- Desktop organizer selection exists and exposes a bottom selection bar.
- `Graph` and original-only `Reader` remain regression-stable.
