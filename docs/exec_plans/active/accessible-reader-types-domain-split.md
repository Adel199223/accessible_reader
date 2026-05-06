# Accessible Reader Types Domain Split ExecPlan

## Status

Completed on May 6, 2026. This branch keeps the frontend type contract behavior-preserving while moving the large `frontend/src/types.ts` body into focused domain modules.

## Intent

Split `frontend/src/types.ts` into domain modules while keeping `frontend/src/types.ts` as the stable public import surface for existing callers and the contract audit lane.

## Scope

- Keep every existing exported type/interface available from `frontend/src/types.ts`.
- Move type definitions into focused modules under `frontend/src/types/` for base aliases, reader/settings, documents, workspace portability, library, import, recall/search, graph, and study contracts.
- Teach `scripts/contracts/audit_api_types_contract.py` to scan `frontend/src/types.ts` plus `frontend/src/types/*.ts` so contract counts and drift checks stay stable.
- Update the API/types contract audit architecture doc to record the type-domain split and the audit-script behavior.

## Non-Goals

- Do not change backend schema, API route behavior, UI, runtime API wrappers, generated TypeScript types, or Neuro Map Studio.
- Do not change caller imports outside the type module split unless TypeScript requires a mechanical type-only adjustment.
- Do not split backend models/storage/routes or frontend product components in this slice.

## Deliverables

- `frontend/src/types.ts`
- `frontend/src/types/base.ts`
- `frontend/src/types/documents.ts`
- `frontend/src/types/graph.ts`
- `frontend/src/types/import.ts`
- `frontend/src/types/library.ts`
- `frontend/src/types/reader.ts`
- `frontend/src/types/recall.ts`
- `frontend/src/types/study.ts`
- `frontend/src/types/workspace.ts`
- `scripts/contracts/audit_api_types_contract.py`
- `docs/architecture/accessible-reader-api-types-contract-audit.md`
- `docs/exec_plans/active/accessible-reader-types-domain-split.md`

## Validation Result

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py`: passed.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json`: passed.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`: passed with 100 frontend type exports, 95 exact frontend/backend contract-name matches, 0 unmatched frontend API wrappers, and the accepted 10 backend-only routes.
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`: 1 passed.
- `cd backend && .venv/bin/python -m pytest -q`: 100 passed.
- `cd frontend && npm exec tsc -- -b --pretty false`: passed.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`: 11 passed.
- `cd frontend && npm test -- --run --reporter=dot`: 14 files passed, 259 tests passed, 20 skipped.
- `cd frontend && npm run build`: passed with the known Vite chunk-size warning.
- `git diff --check`: passed.

## Follow-Up

The next modernization slice should be a generated TypeScript type feasibility audit, not implementation: compare the current hand-authored barrel/module type contract against FastAPI OpenAPI component names and decide whether generation can be introduced without disrupting established frontend names or inline request payloads.
