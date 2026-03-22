# ExecPlan: Stage 396 Post-Stage-395 Home Tag-Tree Board Audit

## Summary
- Audit the Stage 395 `Home` reset against the current Recall organization direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - organizer rail
  - primary reopen lane
  - selected-group board
  - one wider board crop showing reduced dead center
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 395 moved `Home` closer to Recall's current tag-tree-driven library direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 395/396 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
