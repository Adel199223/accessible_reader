# ExecPlan: Stage 479 Home Overview Board And Group Drill-In Reset After Stage 478

## Summary
- Reopen `Home` for the next broad Recall-parity slice after the Stage 478 `Graph` timeline-presets and filter-customization audit.
- Shift the next correction away from organizer micro-polish and into the core Home browsing model itself.
- Make `Home` feel closer to Recall's current tag-panel direction by letting the organizer own filtering on the left while the right side starts as a broader grouped card workspace instead of auto-committing to one collection board by default.

## Benchmark Basis
- Official Recall organization guidance still frames Home as a left-panel navigation model plus a right-side card workspace:
  - [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging)
  - [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading position, and more](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
  - [Release: 15 November 2024 // Exciting Quality of Life Improvements!](https://feedback.getrecall.ai/changelog/release-15-november-2024-exciting-quality-of-life-improvements)
  - [Recall changelog](https://feedback.getrecall.ai/changelog)
- Important benchmark details from those sources:
  - the left tagging panel is the navigation/filter surface
  - clicking a tag filters the card list on the right side of the home page
  - tags stay visible before cards in the tree
  - grid/list behavior and card-at-a-glance improvements matter on Home, not just raw chrome density
- Inference from those sources:
  - because this repo does not yet expose user-defined tags, the best bounded parity move is to treat the existing `Collections` / `Recent` group model as the tag-tree analogue and make the right side behave more like a true grouped workspace before drill-in, rather than pretending one collection is always the only meaningful default board.

## Goals
- Keep the organizer as the owner of `Collections`, `Recent`, search, sort, direction, view, collapse, and hide.
- Stop auto-selecting one branch as the only default `Home` board state.
- Let the right side begin as an overview workspace for the current lens, then drill into one branch when the user explicitly chooses it.
- Preserve current source reopen behavior, organizer-hidden fallback behavior, and source/Reader handoff continuity.

## Scope

### 1. Add a real organizer-owned overview state
- Keep `Collections` as the default organizer lens.
- When no organizer branch is explicitly selected, the right stage should show a grouped overview for the current lens instead of forcing the first branch board open.
- Add an explicit overview/reset row in the organizer so the user can return from a focused branch to the broader overview without losing the current lens, sort, direction, or view state.

### 2. Turn the right side into a grouped workspace before drill-in
- Reuse the existing grouped library data so the right side can render multiple bounded sections in one calmer workspace.
- Keep the reopen continuity cluster attached at the top when it is relevant, but let the grouped overview carry the main stage beneath it.
- Respect the existing `Board` / `List` toggle across the overview workspace, not just within the single-branch state.

### 3. Preserve focused branch drill-in
- Clicking an organizer branch should still focus the right side on that branch.
- The focused branch state should stay cleaner and more direct than the overview state, not disappear.
- The organizer row state should clearly distinguish overview vs focused-branch mode without reviving heavy carded chrome.

### 4. Simplify the hidden-organizer fallback
- When the organizer is hidden, keep the compact controls in the seam and keep the right side coherent in either overview or focused-branch mode.
- Avoid reviving the older “main board plus separate fallback stream” feeling if the primary Home stage can already carry the grouped overview.

## Non-Goals
- No generated-content Reader work.
- No `Reflowed`, `Simplified`, or `Summary` changes.
- No Reader generated-view UX, transform logic, placeholders, controls, or mode-routing changes.
- No backend schema or API changes unless a blocker appears. The intended solution is frontend-only.
- No fake tag editing, tag creation, or drag-and-drop model that the current product does not actually support.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Home regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- continuity docs and a new Stage 479/480 harness pair

## Validation Plan
- Targeted Vitest:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 479/480 harness pair
- live `GET 200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Expected Evidence
- Stage 479 implementation harness should capture:
  - default wide `Home` top state in overview mode
  - organizer overview/reset row plus active group drill-in state
  - grouped overview board/list evidence on the right
  - organizer-hidden compact-controls fallback still working
- Stage 480 audit harness should refresh:
  - `Home`
  - `Graph`
  - original-only `Reader`
- The audit should state clearly whether `Home` now behaves more like a left-driven filter tree plus a right-side card workspace instead of defaulting to one collection board immediately.

## Exit Criteria
- `Home` opens in a real overview workspace for the active organizer lens instead of auto-selecting the first branch.
- The organizer clearly owns the transition between overview and focused-branch drill-in.
- The right side remains coherent in both overview and focused modes, including when the organizer is hidden.
- `Graph` and original-only `Reader` remain regression-stable.
