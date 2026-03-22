# ExecPlan: Stage 388 Post-Stage-387 Home Density Audit

## Summary
- Audit the Stage 387 Home second-pass reset against the current Recall benchmark direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope for this track and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - lighter top seam in place of the older hero framing
  - denser primary saved-source flow
  - reduced blank-space balance in the main lane
- Focused regressions second:
  - focused overview only if needed to confirm the Home pass did not disturb shared-shell continuity

## Acceptance
- The audit states clearly whether Stage 387 moved `Home` closer to Recall’s denser browse-first card-flow direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home second pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 387/388 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
