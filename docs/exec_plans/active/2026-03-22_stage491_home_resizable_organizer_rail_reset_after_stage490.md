# ExecPlan: Stage 491 Home Resizable Organizer Rail Reset After Stage 490

## Summary
- Reopen `Home` for the next broad Recall-parity slice after the Stage 490 Graph audit.
- Keep the current organizer-owned library model intact:
  - `Collections` / `Recent` lens switching
  - organizer-owned search, sort, direction, view, collapse, and hide controls
  - grouped overview before branch drill-in
  - manual ordering, multi-select, and drag-and-drop workbench actions
  - direct source rows in the active branch
- Close the remaining organizer ergonomics gap by turning the left organizer into a real resizable rail instead of a fixed narrow strip.

## Benchmark Direction
- Anchor this pass to Recall's organizer and left-menu direction:
  - [Release: May 9, 2025 // Mix of improvements and bug fixes](https://feedback.getrecall.ai/changelog/release-may-9-2025-mix-of-improvements-and-bug-fixes)
  - [Release: 15 November 2024 // Exciting Quality of Life Improvements!](https://feedback.getrecall.ai/changelog/release-15-november-2024-exciting-quality-of-life-improvements)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
- The repo already matches the broader Recall direction on:
  - organizer-owned navigation instead of a hero-first homepage
  - list/board switching, sorting, direction toggles, and manual ordering
  - collapsible organizer behavior and branch-owned drill-in
  - multi-select plus direct manipulation inside the organizer
- The remaining broad mismatch is rail ergonomics:
  - the Home organizer is still a fixed narrow column
  - long collection or source names still feel more clipped than they should
  - the user cannot widen the organizer when they want stronger browse ownership
- Inference from those sources:
  - the highest-leverage next move is not another micro-trim to card spacing; it is letting the organizer behave like a real working rail that can be widened when needed
  - a resizable organizer rail is the honest parity fit for this repo because it improves the current local-first Home workflow without inventing new tag models or widening into backend work

## Implementation Scope

### 1. Add a real resizable organizer rail to Home
- Add a right-edge resize handle to the visible Home organizer rail on wide desktop.
- Support:
  - pointer drag resizing
  - keyboard resize via arrow keys
  - `Home` / `End` jumps to min/max width
  - double-click reset to default width
- Keep the organizer-hidden path unchanged.

### 2. Let rail width drive the desktop workbench layout
- Replace the fixed organizer column width with a width that follows the new rail state.
- Preserve the calmer board-first hierarchy on the right:
  - the board should stay dominant
  - the organizer should grow only within a bounded desktop range
- Do not reintroduce a heavy top hero or a competing secondary lane.

### 3. Improve long-name readability inside the organizer
- Use the wider rail to reduce clipping pressure on:
  - top-level group titles
  - group note/source detail lines
  - active branch source titles
- Keep the organizer lean; do not turn every row into a full card.
- Favor better wrapping and readable line lengths over decorative chrome.

### 4. Preserve the existing Home behavior and restrictions
- Preserve:
  - lens switching
  - grouped overview behavior
  - branch drill-in
  - board/list switching
  - manual reorder, drag-and-drop, and organizer selection bar
  - organizer hide/show behavior
- Do not reopen `Graph` or `Reader` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.
- Do not add backend schema changes; the intended solution stays frontend-only.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Home regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `frontend/src/lib/appRoute.ts` only if a small continuity type addition becomes truly necessary

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock:
  - the visible Home organizer exposes a resize separator
  - keyboard resize updates the organizer rail width
  - double-click reset restores the default width
  - organizer hide/show keeps the new rail behavior bounded to the visible state
- Keep `frontend/src/App.test.tsx` aligned with the new Home workflow so:
  - organizer controls still stay in the rail
  - manual ordering and selection still coexist with the resized rail
  - the board remains the primary right-side surface
- Add a new real Edge harness pair:
  - Stage 491 implementation harness for wide Home default state, widened organizer state, and organizer-hidden fallback
  - Stage 492 audit harness refreshing `Home`, `Graph`, and original-only `Reader`

## Validation
- targeted Vitest for:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 491/492 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Exit Criteria
- Wide desktop `Home` now exposes a real organizer resize workflow instead of a fixed narrow left rail.
- Users can widen, narrow, keyboard-adjust, and reset the organizer without breaking the current board-first library flow.
- Long collection/source names read more comfortably in the organizer when the rail is widened.
- `Graph` and original-only `Reader` stay visually stable behind the Home pass.
