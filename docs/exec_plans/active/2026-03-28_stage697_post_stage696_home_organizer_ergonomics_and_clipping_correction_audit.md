# ExecPlan: Stage 697 Post-Stage-696 Home Organizer Ergonomics And Clipping Correction Audit

## Summary
- Audit the Stage 696 Home ergonomics pass against the March 25, 2026 Recall homepage benchmark and the Stage 695 blocker list.
- Confirm that the organizer seam is calmer, the organizer remains collapsible/resizable, and the known Home clipping cases are resolved in live Edge.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while the queued roadmap stays pointed at the later Stage 698-707 slices.

## Scope
- Capture wide-desktop Home with organizer open, organizer collapsed, selected section board, and any representative clipping-prone cards.
- Measure whether the organizer resize seam stays subtle until hovered/focused/dragged.
- Verify organizer width continuity after collapse/reopen.
- Verify the live clipping count in the audited Home state drops from the Stage 695 value of `5`.
- Capture stable regression evidence for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`.

## Acceptance
- The live Home audit shows the organizer seam as subtle at rest and clearly interactive only on hover/focus/drag.
- The organizer launcher and close controls remain deliberate and stable.
- The clipped organizer/card text cases recorded in Stage 695 are materially reduced or eliminated, with the target outcome being zero visible clipping cases.
- Regression captures for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` stay stable.

## Validation
- Stage 697 live Edge audit
- targeted Home Vitest coverage
- `backend/tests/test_api.py -k graph -q`
- `frontend/npm run build`
