# ExecPlan: Stage 487 Home Drag-Drop Organizer Workbench Reset After Stage 486

## Summary
- Reopen `Home` for the next broad Recall-parity slice after the Stage 486 Graph audit.
- Keep the current collection-led lens, grouped overview workspace, manual ordering mode, and organizer selection model intact.
- Close the remaining organizer-interaction gap by making manual mode feel like a real workbench instead of a button-driven reorder utility.

## Benchmark Direction
- Anchor this pass to Recall's current organization direction:
  - [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging)
  - [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading position](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
  - [Release: 15 November 2024 // Exciting Quality of Life Improvements!](https://feedback.getrecall.ai/changelog/release-15-november-2024-exciting-quality-of-life-improvements)
- The repo already matches the broader Recall direction on:
  - organizer-owned search, lens, sort, and board/list controls
  - explicit grouped overview before branch drill-in
  - manual ordering mode
  - desktop multi-selection with a bottom organizer selection bar
- The remaining broad gap is interaction quality:
  - manual ordering still depends on repeated `Up` / `Down` button stacks
  - the organizer selection bar is still mostly a status strip with limited bulk utility
  - organizer work does not yet read like direct manipulation
- Inference from those sources:
  - because this repo does not ship Recall's full editable tag system, the honest parity move is to improve manipulation quality for the real organizer model we already have: collection/recent groups plus source rows
  - drag-and-drop plus stronger batch move actions are higher leverage than another density or wording trim

## Implementation Scope

### 1. Add drag-and-drop ordering for organizer groups in manual mode
- Replace the current row-level `Up` / `Down` dependence with a true drag affordance for top-level organizer groups.
- Keep drag available only when `Manual` mode is active.
- Add clear hover and drop-target feedback so the destination reads before drop.
- Reorder the real local manual section order state instead of simulating movement visually.

### 2. Add drag-and-drop ordering for active branch source rows in manual mode
- Add the same direct-manipulation model to source rows inside the expanded active branch.
- Keep movement scoped to the current real branch only; do not fake cross-collection moves.
- Preserve current source-open behavior on the row body while isolating drag to a dedicated handle.

### 3. Promote the organizer selection bar into a real batch-action rail
- Keep the current selection summary, but make the action side more useful in manual mode.
- For homogeneous section selections, expose batch `Move earlier` / `Move later` actions that preserve relative order.
- For homogeneous document selections inside one section, expose the same batch movement model.
- Keep mixed or unsupported selections honest: show only the actions that truly work.
- Preserve single-item actions such as `Show in board` and `Open source`.

### 4. Preserve the current Home workflow and constraints
- Preserve:
  - `Collections` and `Recent` lenses
  - grouped overview default state
  - branch drill-in behavior
  - search, board/list, and sort controls
  - organizer-hidden compact fallback
  - Reader/source reopen flow
- Do not invent editable tags, fake nested collections, or backend-backed drag persistence beyond the existing local continuity model.

## Explicit Restrictions
- Do not reopen `Graph` design work in this stage except for regression verification.
- `Reader` remains original-only and cosmetic-only in this track.
- Do not change `Reflowed`, `Simplified`, or `Summary`.
- Do not change generated-view UX, transform logic, placeholders, controls, or mode-routing.
- Do not add backend schema changes unless a blocker appears. The intended solution is frontend-only.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Home regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `frontend/src/lib/appRoute.ts` only if a tiny continuity addition becomes truly necessary

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock:
  - drag handles appearing only in manual mode
  - drag-and-drop reordering of top-level organizer groups
  - drag-and-drop reordering of active branch source rows
  - stronger organizer selection bar actions for batch movement
- Keep `frontend/src/App.test.tsx` aligned with the new Home workflow so:
  - grouped overview still opens first
  - manual mode still works
  - drag/batch move actions coexist with board drill-in and source reopen
- Add a new real Edge harness pair:
  - Stage 487 implementation harness for wide Home default state, manual-mode drag workbench state, and batch-action selection bar state
  - Stage 488 audit harness refreshing `Home`, `Graph`, and original-only `Reader`

## Validation
- targeted Vitest for:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 487/488 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Exit Criteria
- Wide desktop `Home` manual mode reads like a direct-manipulation organizer workbench instead of a stacked move-button utility.
- Top-level groups and active branch source rows can both be reordered through real drag-and-drop.
- The organizer selection bar provides meaningful batch movement for supported selections.
- `Graph` and original-only `Reader` stay visually stable behind the Home pass.
