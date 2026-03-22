# ExecPlan: Stage 432 Post-Stage-431 Home Organizer Control Deck Audit

## Summary
- Audit the Stage 431 `Home` organizer-control reset against the current Recall homepage direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not appear in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - slimmer Home control seam
  - organizer control deck with sort/collapse/hide behavior
  - organizer-hidden state
  - selected-group board and pinned reopen shelf
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 431 moved `Home` closer to Recall's current organizer-led homepage direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 431/432 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
