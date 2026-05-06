# Accessible Reader Generated Type Feasibility ExecPlan

## Status

Completed on May 6, 2026. This docs-only feasibility audit is stacked on the completed API and type domain split work.

## Intent

Decide whether Accessible Reader should introduce generated TypeScript contract types from the FastAPI OpenAPI schema, and if so, how to stage that work without disrupting the existing frontend compatibility barrels or runtime behavior.

## Scope

- Inspect FastAPI OpenAPI schemas and backend Pydantic model names.
- Compare OpenAPI component names against the current `frontend/src/types.ts` public barrel and `frontend/src/types/*.ts` domain modules.
- Identify direct generation candidates, compatibility-alias candidates, frontend-only convenience types, backend-only/internal models, and inline request/response shapes.
- Evaluate lightweight generation paths, including a docs-only no-generation path, a schema snapshot check, a narrow in-repo generator, and third-party OpenAPI TypeScript generation.
- Recommend the next safest implementation slice.

## Non-Goals

- Do not change backend schema, API route behavior, UI, runtime API wrappers, or frontend product behavior.
- Do not replace hand-authored frontend types or add generated TypeScript files in this slice.
- Do not split additional product files.
- Do not edit Neuro Map Studio.
- Do not push, merge, rebase, squash, force-push, or delete branches.

## Deliverables

- `docs/architecture/accessible-reader-generated-type-feasibility.md`
- `docs/exec_plans/active/accessible-reader-generated-type-feasibility.md`
- Review artifacts under `/home/fa507/Downloads/accessible-reader-generated-type-feasibility/`

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json`
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `git diff --check`

## Validation Result

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py`: passed and emitted Markdown inventory.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json`: passed and emitted JSON inventory.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`: passed.
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`: 1 passed.
- `cd frontend && npm exec tsc -- -b --pretty false`: passed.
- `git diff --check`: passed.

## Recommendation

Add a normalized OpenAPI schema snapshot/check lane next. Defer generated TypeScript files until that lane records schema names, route operation keys, multipart/download exceptions, backend-only/context-only schemas, and the compatibility alias map for intentional frontend names.
