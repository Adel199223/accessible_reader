# ExecPlan: Stage 444 Post-Stage-443 Home Single-Board Pinned-Cluster Audit

## Summary
- Audit the Stage 443 `Home` board-fusion reset against the current Recall organization direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - organizer dock
  - primary board shell
  - pinned reopen cluster
  - active board state

## Acceptance
- The audit states clearly whether Stage 443 moved `Home` closer to Recall's current organizer-led single-board direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 443/444 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
