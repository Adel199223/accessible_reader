# Accessible Reader OpenAPI Snapshot Check Lane ExecPlan

## Status

Completed on May 6, 2026. This behavior-preserving contract hardening slice is stacked on the generated type feasibility audit.

## Intent

Add a normalized OpenAPI snapshot/check lane before generated TypeScript adoption. The lane should make schema names, route operations, intentional aliases, and browser/form/download exceptions reviewable without changing runtime behavior.

## Scope

- Extend `scripts/contracts/audit_api_types_contract.py` with developer-only OpenAPI snapshot output and check commands.
- Add a fixture that records normalized OpenAPI version, schema names, route operation keys, intentional compatibility aliases, backend-only/context-only schema names, and multipart/download route exceptions.
- Add a focused backend pytest wrapper for the new snapshot check command.
- Update architecture docs to record the new lane and recommended generated-type staging.

## Non-Goals

- Do not change backend schema, API route behavior, UI, runtime API wrappers, generated Reader output, or generated TypeScript files.
- Do not replace `frontend/src/types.ts` or `frontend/src/api.ts`.
- Do not split additional product files.
- Do not edit Neuro Map Studio.
- Do not push, merge, rebase, squash, force-push, or delete branches.

## Deliverables

- `scripts/contracts/audit_api_types_contract.py`
- `scripts/contracts/expected_openapi_snapshot.json`
- `backend/tests/test_contract_inventory.py`
- `docs/architecture/accessible-reader-generated-type-feasibility.md`
- `docs/exec_plans/active/accessible-reader-openapi-snapshot-check-lane.md`
- Review artifacts under `/home/fa507/Downloads/accessible-reader-openapi-snapshot-check-lane/`

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `git diff --check`

## Validation Result

- Red check: `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q` failed before implementation because `--check-openapi-snapshot` was an unrecognized script argument.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --openapi-snapshot`: passed and emitted normalized JSON.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`: passed.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`: passed.
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`: 2 passed.
- `python3 -c "import json, pathlib; json.loads(pathlib.Path('docs/assistant/manifest.json').read_text()); print('manifest ok')"`: passed.
- `cd frontend && npm exec tsc -- -b --pretty false`: passed.
- `git diff --check`: passed.

## Follow-Up

After review, the next modernization slice can try generated TypeScript as a private reference file only, likely through `openapi-typescript`, while keeping `frontend/src/api.ts` and `frontend/src/types.ts` as the public compatibility barrels.
