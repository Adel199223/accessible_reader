# Accessible Reader Generated DocumentView Alias Trial ExecPlan

## Status

Started on May 6, 2026. This slice is stacked on `accessible-reader-generated-type-mapping-check`.

Implementation checkpoint:

- The first generated-type alias adoption is intentionally limited to `DocumentView`.
- `frontend/src/types/reader.ts` keeps `DocumentView` as the public export name and points it at the private generated OpenAPI reference with a type-only alias.
- `scripts/contracts/expected_generated_type_adoptions.json` records the one allowed adoption and the deferred follow-ups.
- The adoption guard scans frontend type modules for generated OpenAPI aliases, enforces pure alias syntax, and fails on unreviewed generated alias adoption.
- `backend/tests/test_contract_inventory.py` now runs the generated type adoption guard with the other contract checks.
- Assistant verification docs and manifest commands now include the adoption check.

## Intent

Trial one selective generated-type alias while preserving the public frontend type name and keeping generated OpenAPI usage type-only.

## Scope

- Convert `DocumentView` in `frontend/src/types/reader.ts` to a type-only alias backed by the private generated OpenAPI reference.
- Preserve `DocumentView` as the public export from `frontend/src/types.ts`.
- Add a check-only script guard that records the intentionally adopted alias.
- Keep the generated type mapping check green.
- Update architecture and assistant verification docs.

## Non-Goals

- Do not change backend schema, API route behavior, UI, runtime API wrappers, or generated Reader output.
- Do not adopt generated aliases for any other public frontend types.
- Do not import generated OpenAPI types from runtime code.
- Do not generate a client.
- Do not edit Neuro Map Studio.
- Do not push, merge, rebase, squash, force-push, or delete branches.

## Deliverables

- `frontend/src/types/reader.ts`
- `scripts/contracts/expected_generated_type_adoptions.json`
- `scripts/contracts/audit_api_types_contract.py`
- `backend/tests/test_contract_inventory.py`
- `docs/architecture/accessible-reader-generated-type-feasibility.md`
- `docs/exec_plans/active/accessible-reader-generated-documentview-alias-trial.md`
- Review artifacts under `/home/fa507/Downloads/accessible-reader-generated-documentview-alias-trial/`

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-adoptions`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `git diff --check`

## Completion Notes

- Keep broader generated-type adoption paused until this single-alias trial is reviewed.
- Do not adopt `DocumentRecord` next without resolving optional/default-backed generated fields such as `available_modes` and `progress_by_mode`.
- Review hardening closed the scanner gap: unreviewed generated aliases are now discovered rather than inferred only from the fixture.
