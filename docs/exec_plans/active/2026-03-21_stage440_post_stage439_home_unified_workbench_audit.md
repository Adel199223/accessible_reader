# ExecPlan: Stage 440 Post-Stage-439 Home Unified Workbench Audit

## Summary
- Audit the Stage 439 `Home` workbench reset against the current Recall organization direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - slimmer workbench bar
  - organizer dock
  - primary library workbench
  - reopen dock
  - active group board

## Acceptance
- The audit states clearly whether Stage 439 moved `Home` closer to Recall's current organizer-led library-workbench direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 439/440 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
