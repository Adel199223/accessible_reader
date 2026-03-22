# ExecPlan: Stage 392 Post-Stage-391 Home Tree-Filtered Audit

## Summary
- Audit the Stage 391 Home reset against the current Recall organization and library benchmark direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope for this track and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - slimmer Home control seam
  - organizer-tree browse rail
  - denser main source board
  - lower continuation state only if it still exists as a distinct element
- Focused regressions second:
  - focused overview only if needed to confirm the shared Home shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 391 moved `Home` closer to Recall’s current organized-library direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 391/392 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
