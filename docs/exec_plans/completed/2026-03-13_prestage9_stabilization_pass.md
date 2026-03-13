# ExecPlan: Pre-Stage-9 Stabilization Pass

## Summary
- Pause Stage 9 implementation long enough to harden degraded-state behavior when the local API is unreachable.
- Keep the fix frontend-only unless validation reveals a backend defect.
- Return to the Stage 9 notes/highlights milestone immediately after this pass is validated.

## Public Interfaces
- Keep current backend routes unchanged.
- Improve frontend network error messaging for unreachable local-service failures.
- Add lightweight retry actions in Reader and Recall for failed initial loads.

## Implementation Changes
- Shared frontend API layer:
  - normalize fetch-level network failures into actionable local-service copy
  - keep HTTP error detail handling unchanged when the backend responds
- Recall shell:
  - track explicit load/error/success state for documents, graph, study, and selected document detail
  - show `Library unavailable`, `Graph unavailable`, and `Study unavailable` status chips on failed initial loads
  - add a retry action that reruns the failed initial loads without a full refresh
- Reader:
  - distinguish `service unavailable` from `empty library`
  - keep import controls usable during API failures
  - add a retry action for failed initial loading

## Test Plan
- Add targeted frontend tests for:
  - shared API network error normalization
  - Recall initial-load failure UI
  - Reader initial-load failure UI
  - retry recovery after a transient failure
- Re-run backend/frontend/extension validation.
- Repeat a Playwright smoke pass for healthy flows plus simulated degraded-state recovery.

## Assumptions
- The `Failed to fetch` screenshots reflect intermittent local-service unavailability, not content corruption.
- No Stage 9 note/highlight behavior ships in this detour.

## Outcome
- Completed on 2026-03-13 before Stage 9 resumed.
- Landed:
  - shared frontend network-error normalization for unreachable local-service requests
  - retryable unavailable states in Recall and Reader with clearer recovery copy
  - targeted frontend regression coverage for initial-load failure and retry recovery
- Validated with:
  - backend `pytest`
  - backend app import check
  - frontend `npm test -- --run`, `npm run lint`, and `npm run build`
  - extension `npm test -- --run` and `npm run build`
  - live Playwright smoke coverage for healthy Recall -> Reader handoff plus simulated outage/retry recovery on both surfaces
