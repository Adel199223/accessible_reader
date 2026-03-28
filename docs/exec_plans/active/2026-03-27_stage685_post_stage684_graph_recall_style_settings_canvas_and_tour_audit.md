# ExecPlan: Stage 685 Post-Stage-684 Graph Recall-Style Settings, Canvas, and Tour Audit

## Summary
- Audit the Stage 684 browse-Graph parity reset against the March 26, 2026 Recall Graph screenshot set and the supporting Recall Graph docs.
- Confirm that the new left settings panel, top-right search/navigation corner, calmer canvas, compact idle state, contextual focus tray, and replayable Graph tour materially reduce the remaining wide-desktop `Graph` mismatch.
- Keep focused reader-led `Graph`, `Home`, and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop first:
  - `Graph` default with tour visible
  - `Graph` default after dismissing the tour
  - `Graph` selected-node state
  - `Graph` path-selection state
  - `Graph` filtered/group state
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - left settings panel
  - top-right search/navigation corner
  - bottom-left count pill
  - bottom-right help/replay controls
  - selected-node inspect drawer

## Acceptance
- The audit states clearly whether Stage 684 materially reduced the remaining default-state Graph mismatch against the March 26 Recall benchmark.
- The audit records whether the Graph settings panel now behaves like the primary browse control surface instead of a secondary floating drawer.
- The audit records whether the canvas reads calmer and more Recall-like at rest because nodes are circular, labels are external, and idle chrome is lighter.
- The audit records whether the Graph tour is understandable, dismissible, replayable, and non-blocking after the first-run flow.
- The handoff repeats that the milestone stayed `Graph`-only and did not reopen shared shell, `Home`, `Notes`, `Study`, or generated-content `Reader`.

## Validation
- `node --check` for the Stage 684/685 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 684/685 touched files
- the Stage 684 targeted Vitest, backend graph regression, and build passes remain the implementation gate beneath this audit
