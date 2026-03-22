# ExecPlan: Stage 471 Home Organizer Tree-Branch Navigation Reset After Stage 470

## Summary
- Reopen `Home` for one broader Recall-parity correction centered on the organizer rail itself, not another board-density trim.
- Current evidence shows the board and controls are materially calmer, but the left rail still behaves like a grouped preview strip. Official Recall guidance now describes the left side as a tag tree where cards live directly under the active branch and the panel owns more of the navigation work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Benchmark Direction
- Anchor this pass to Recall's current official organization guidance:
  - [Tagging](https://docs.getrecall.ai/deep-dives/tagging)
  - [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading position and share cards with a beautiful link preview.](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
  - [Release Notes: October 22, 2025 – Bulk Tagging and a Smoother Mobile Experience](https://feedback.getrecall.ai/changelog/release-notes-october-22-2025-bulk-tagging-and-a-smoother-mobile-experience)

## Implementation Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` so the organizer reads more like a true tree-driven navigation surface.
- Shift the active branch behavior in the left rail:
  - the selected organizer row expands into a fuller inline source tree instead of only short preview teasers
  - child rows should read like direct source navigation, not decorative preview cards
  - the organizer should carry more of the “open next source” responsibility while staying compact enough to scan
- Rebalance the right-side workbench:
  - let the active board start sooner and read more like the direct result area for the selected branch
  - reduce the sense that pinned reopen continuity is a competing shelf when the organizer is visible
  - keep filtered results inside the same working shell
- Preserve existing Home product behavior:
  - search
  - updated/created/A-Z sorting
  - direction toggles
  - board/list switching
  - organizer hide/show
  - collapse/expand preview state
  - source reopen continuity
  - source handoffs into `Reader`, `Notes`, `Graph`, and `Study`
- Limit shared-shell changes to only what is required for the new Home hierarchy to read correctly.

## Explicit Restrictions
- Do not reopen `Graph` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock the new Home organizer hierarchy:
  - the active organizer branch exposes a fuller inline source list
  - the organizer still owns search/sort/view/hide actions
  - the board starts with a calmer selected-branch result area instead of a competing reopen shelf
  - filtered results and organizer-hidden fallback still work
- Keep `frontend/src/App.test.tsx` aligned with the new Home interactions so organizer switching, source selection, hide/show, list view, and cross-section handoffs still work.
- Add a new real Edge harness pair:
  - Stage 471 implementation harness for wide Home top state, organizer branch expanded state, selected-board state, and organizer-hidden fallback
  - Stage 472 audit harness refreshing `Home`, `Graph`, and original-only `Reader`

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` and `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 471/472 harnesses
- live `200` checks for `http://127.0.0.1:8000/recall` and `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`
