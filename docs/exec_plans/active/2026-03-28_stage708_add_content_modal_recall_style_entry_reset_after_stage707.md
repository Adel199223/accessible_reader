# ExecPlan: Stage 708 Add Content Modal Recall-Style Entry Reset After Stage 707

## Summary

- Reopen `Add Content` as the first intentional post-closeout surface after the completed Stage 706/707 stable baseline.
- Keep this slice tightly bounded to the global add/import dialog plus its launcher hierarchy.
- Use the user-provided Recall Add Content benchmark screenshot from March 15, 2026, the Recall Add Content tutorial, and the January 9, 2025 Recall changelog entry for the current in-app add flow as the directional benchmark.
- Keep `Home`, `Graph`, embedded `Notebook`, `Reader`, and `Study` as regression surfaces only; do not reopen their broader layout structure here.

## Goals

- Replace the current generic form-first import dialog with a clearer Recall-style “one place to add things” entry surface.
- Preserve the pen-style `New note` affordance outside the modal and keep note creation out of the import modal itself.
- Keep all import capabilities and local-first behavior intact:
  - pasted text
  - one supported public article URL
  - local file import

## Non-Goals

- No backend API, storage, parser, or import-pipeline changes.
- No top-level `Notes` destination revival.
- No broader `Home` re-layout beyond the top-right add launcher and existing add tile opening the refreshed dialog.
- No new unsupported Recall actions such as wiki import, browser extension import inside the modal, or cloud-only source types.

## Implementation Outline

### 1. Dialog shell and hierarchy

- Refine the global `WorkspaceDialogFrame` path used by the add flow so the dialog feels more deliberate and less like a generic settings/search modal clone.
- Keep the dialog wide, but make the visual hierarchy more Recall-like:
  - clearer title and support copy
  - stronger primary entry region
  - quieter secondary support framing
  - calmer close action

### 2. Import panel reset

- Rework `ImportPanel` from a stacked generic form into a more guided add surface:
  - top mode chooser remains `Paste text`, `Web page`, and `Choose file`
  - selected mode becomes visually dominant and easier to scan
  - primary form gets a stronger dedicated panel
  - support copy becomes shorter and more grouped
  - file import becomes a clearer drop-zone style target
- Keep the current actual submit actions and handlers unchanged.

### 3. Launcher alignment

- Keep the existing top-right add button and first-group `Add Content` tile wired to the same dialog.
- Tighten the visible launcher language/chrome so the add entry feels more like a Recall-style global add action rather than an older local import form.
- Preserve the existing pen-style `New note` action beside `Add`.

### 4. Regression-safe continuity

- Keep active reading flows adding sources through the same global dialog.
- Keep note flows reopening Notebook rather than using the add modal.
- Keep current shell, Home board, Graph, Reader, and Study structures unchanged outside the add entry surface.

## Public Interfaces

- No backend changes.
- No route-contract changes.
- No new storage or API fields.
- No change to supported import types.

## Validation Plan

- Frontend:
  - update `frontend/src/components/ImportPanel.test.tsx`
  - update targeted `frontend/src/App.test.tsx` add-dialog coverage
  - keep `frontend/src/components/RecallWorkspace.stage37.test.tsx` stable for the Home add tile launcher
  - keep `frontend/src/components/RecallShellFrame.test.tsx`, `frontend/src/components/SourceWorkspaceFrame.test.tsx`, and `frontend/src/components/RecallWorkspace.stage34.test.tsx` green as regression checks
- Backend:
  - no new backend behavior expected; rerun targeted backend regression only if needed
- Live audit:
  - add Stage 708 implementation and Stage 709 audit harnesses
  - capture:
    - Home with the add dialog open
    - add dialog in each mode
    - Reader route opening the same add dialog
    - stable Home / Graph / Notebook / Reader / Study regressions

## Acceptance Bar

- The add dialog must read as a deliberate product entry surface rather than a generic form card.
- Mode selection and the active mode’s primary action must be more obvious at a glance.
- The top-right add launcher and Home add tile must still work.
- Notebook placement must remain separate from the add modal.
- No import capability regression is allowed.
