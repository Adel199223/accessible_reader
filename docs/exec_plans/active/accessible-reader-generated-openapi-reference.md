# Accessible Reader Generated OpenAPI Reference ExecPlan

## Status

Started on May 6, 2026. This slice is a private generated TypeScript reference experiment stacked on the OpenAPI snapshot check lane.

## Intent

Prove Accessible Reader can generate deterministic runtime-free TypeScript OpenAPI reference types without replacing the public frontend type barrel, API wrapper barrel, or runtime behavior.

## Scope

- Add `openapi-typescript` as a frontend dev-only dependency.
- Add a private generated reference file under `frontend/src/generated/`.
- Extend the contract script with a check-only command that regenerates the reference from local FastAPI OpenAPI and fails when the committed file is stale.
- Wire the check into `backend/tests/test_contract_inventory.py`.
- Document the lane and the next adoption decision.

## Non-Goals

- Do not change backend schema, API route behavior, UI, runtime API wrappers, or generated Reader output.
- Do not replace `frontend/src/types.ts`, `frontend/src/api.ts`, or domain type modules.
- Do not import the generated file from product code.
- Do not split additional product files.
- Do not edit Neuro Map Studio.
- Do not push, merge, rebase, squash, force-push, or delete branches.

## Deliverables

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/src/generated/openapi.ts`
- `scripts/contracts/audit_api_types_contract.py`
- `backend/tests/test_contract_inventory.py`
- `docs/architecture/accessible-reader-generated-type-feasibility.md`
- `docs/exec_plans/active/accessible-reader-generated-openapi-reference.md`
- Review artifacts under `/home/fa507/Downloads/accessible-reader-generated-openapi-reference/`

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `git diff --check`

## Completion Notes

- The generated OpenAPI file is private/reference-only and is not imported by product code.
- The checker validates deterministic regeneration plus anchors for `paths`, `components`, `operations`, core records, multipart body aliases, validation schemas, and inline request-body shapes.
- The next modernization slice should add a small mapping/compatibility assertion before any selective generated-type alias adoption.
