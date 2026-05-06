# Accessible Reader API Domain Split ExecPlan

## Status

Behavior-preserving API client domain split branch in progress on May 6, 2026.

## Intent

Split the frontend API wrapper implementation by domain while keeping `frontend/src/api.ts` as the stable public import surface.

## Scope

- Keep all existing API wrapper names and imports available from `frontend/src/api.ts`.
- Move shared request, URL-base, and `ApiRequestError` helpers into `frontend/src/api/core.ts`.
- Move wrapper implementations into domain modules for reader/import, Recall notes/documents, graph, study, library, and workspace portability.
- Teach the contract audit script to scan the barrel plus `frontend/src/api/*.ts`.

## Non-Goals

- Do not change backend schema, API route behavior, UI, `frontend/src/types.ts`, or generated TypeScript types.
- Do not change caller imports outside the API module split unless TypeScript requires a mechanical type-only adjustment.
- Do not edit Neuro Map Studio.

## Deliverables

- `frontend/src/api.ts`
- `frontend/src/api/core.ts`
- `frontend/src/api/reader.ts`
- `frontend/src/api/recall.ts`
- `frontend/src/api/graph.ts`
- `frontend/src/api/study.ts`
- `frontend/src/api/library.ts`
- `frontend/src/api/workspace.ts`
- `scripts/contracts/audit_api_types_contract.py`
- `docs/architecture/accessible-reader-api-types-contract-audit.md`
- `/home/fa507/Downloads/accessible-reader-api-domain-split/`
- `/home/fa507/Downloads/accessible-reader-api-domain-split-share.zip`

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json > /tmp/accessible_reader_api_domain_split_contract.json`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`
- `cd backend && .venv/bin/python -m pytest -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `git diff --check`

If the known `App.test.tsx` timing flake appears, rerun the focused failing test and one full frontend test run. Proceed only if the final full run passes.

## Recommendation

After this split is stable, keep using the contract drift check as the guard before considering a `frontend/src/types.ts` domain split or generated TypeScript types from OpenAPI.
