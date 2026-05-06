# Accessible Reader Generated Type Mapping Check ExecPlan

## Status

Started on May 6, 2026. This slice is stacked on `accessible-reader-generated-openapi-reference`.

## Intent

Add a small check-only mapping assertion between the private generated OpenAPI TypeScript reference and selected public frontend type modules before any generated-type adoption.

## Scope

- Add a fixture-backed generated/public type mapping check.
- Keep `frontend/src/generated/openapi.ts` private and reference-only.
- Assert a tiny low-risk exact mapping set where generated OpenAPI schema names and public frontend type names already align.
- Record intentional hand-authored alias decisions for frontend-only or naming-only contracts.
- Wire the check into `backend/tests/test_contract_inventory.py`.
- Update architecture and assistant verification docs.

## Non-Goals

- Do not change backend schema, API route behavior, UI, runtime API wrappers, or generated Reader output.
- Do not import `frontend/src/generated/openapi.ts` from product code.
- Do not replace `frontend/src/types.ts` or domain type module exports.
- Do not add generated clients.
- Do not edit Neuro Map Studio.
- Do not push, merge, rebase, squash, force-push, or delete branches.

## Deliverables

- `scripts/contracts/expected_generated_type_mapping.json`
- `scripts/contracts/audit_api_types_contract.py`
- `backend/tests/test_contract_inventory.py`
- `docs/architecture/accessible-reader-generated-type-feasibility.md`
- `docs/assistant/QA_CHECKS.md`
- `docs/assistant/SAFE_COMMANDS.md`
- `docs/assistant/manifest.json`
- Review artifacts under `/home/fa507/Downloads/accessible-reader-generated-type-mapping-check/`

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --generated-type-mapping`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `git diff --check`

## Completion Notes

- The mapping check asserts only reference-level stability for a tiny exact interface/property set.
- The selected mapping set is `DocumentRecord`, `DocumentView`, `RecallDocumentRecord`, `KnowledgeGraphSnapshot`, `StudyCardRecord`, `LibraryReadingQueueRow`, and `WorkspaceExportManifest`.
- The fixture records alias/deferred decisions for `DocumentMode -> ViewMode`, `DetailLevel -> SummaryDetail`, `StudyReviewRatingLabel -> StudyReviewRating`, `StudyCardQuestionPayload`, `RetrievalHitType`, and `StudyGeneratedCardType`.
- This is not generated-type adoption and does not assert deep TypeScript assignability.
