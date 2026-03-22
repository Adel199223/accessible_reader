# ExecPlan: Stage 467 Home Organizer Sorting And Board View Reset After Stage 466

## Summary
- Reopen `Home` for one broader Recall-parity correction centered on organizer-owned controls, not another seam-only trim.
- Current evidence shows the organizer rail is calmer, but it still exposes only a narrow two-mode sort model and a fixed board presentation. Official Recall guidance and release notes now emphasize richer left-panel sorting, sort direction, expand/collapse control, and flexible grid/list workspace viewing.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Benchmark Direction
- Anchor this pass to Recall's current official organization guidance:
  - [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging)
  - [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading position](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
  - [Release: 15 November 2024 // Exciting Quality of Life Improvements!](https://feedback.getrecall.ai/changelog/release-15-november-2024-exciting-quality-of-life-improvements)
  - [Recall changelog](https://feedback.getrecall.ai/changelog)

## Implementation Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx`, `frontend/src/index.css`, and continuity state as needed so the organizer rail reads more like a true organization panel instead of a lightly decorated filter strip.
- Replace the current narrow `Recent` / `A-Z` sort pair with a richer organizer-owned sort model that fits existing local data:
  - `Updated`
  - `Created`
  - `A-Z`
- Add sort direction control so automatic sorting feels closer to Recall's current tag-panel behavior instead of a one-direction-only model.
- Add a board-view toggle owned by the organizer control deck:
  - `Board`
  - `List`
- Apply those controls to the active board and filtered results so they materially change the Home workspace rather than acting as decorative chips.
- Keep collapse/hide organizer controls, but regroup them inside a calmer control deck that reads like one organizer command surface.
- Preserve the current broad Home behavior:
  - grouped organizer selection
  - attached reopen continuity
  - search staying in the organizer
  - selected-group board continuity
  - organizer-hidden fallback flow
- Limit shared-shell changes to only what is needed for the new Home hierarchy to read correctly.

## Explicit Restrictions
- Do not reopen `Graph` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock the new Home control model:
  - organizer control deck exposes `Updated`, `Created`, `A-Z`
  - sort direction controls exist and materially affect ordering
  - board-view toggle exists and changes the board shell/list classes
  - organizer-hidden compact controls preserve the same capabilities
- Keep `frontend/src/App.test.tsx` aligned with the new Home controls so organizer hiding, sorting, filtering, and active-board continuity still work.
- Update `frontend/src/lib/appRoute.ts` and `frontend/src/lib/appRoute.test.ts` if continuity state expands for the richer Home control model.
- Add a new real Edge harness pair:
  - Stage 467 implementation harness for wide Home top state, organizer control deck, list-view state, and filtered-results state
  - Stage 468 audit harness refreshing `Home`, `Graph`, and original-only `Reader`

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx`, `App.test.tsx`, and `appRoute.test.ts` if continuity state changes
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 467/468 harnesses
- live `200` checks for `http://127.0.0.1:8000/recall` and `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`
