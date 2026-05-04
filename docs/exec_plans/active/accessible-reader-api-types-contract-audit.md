# Accessible Reader API/Types Contract Audit ExecPlan

## Status

Behavior-preserving contract audit branch in progress on May 4, 2026.

## Intent

Compare Accessible Reader's FastAPI/OpenAPI/Pydantic route and model contract with the frontend `api.ts` and `types.ts` contract layer, then identify the safest next modernization slice before any file splitting.

## Scope

- Inventory backend OpenAPI paths, operations, request shapes, response shapes, and content behavior.
- Inventory frontend API wrappers and match them to backend routes or URL builder targets.
- Inventory frontend exported types and backend Pydantic models by domain.
- Add one lightweight check-only developer script that prints the inventory to stdout.
- Keep drift findings descriptive in this slice.
- Keep Neuro Map Studio status-only/read-only.

## Non-Goals

- Do not change backend schema, API route behavior, UI, storage, or generated Reader output.
- Do not split `frontend/src/api.ts` or `frontend/src/types.ts`.
- Do not add generated TypeScript types.
- Do not split backend models, storage, routes, CSS, or `RecallWorkspace.tsx`.
- Do not edit Neuro Map Studio.
- Do not update `docs/ROADMAP.md` or `docs/ROADMAP_ANCHOR.md`.

## Deliverables

- `docs/architecture/accessible-reader-api-types-contract-audit.md`
- `docs/exec_plans/active/accessible-reader-api-types-contract-audit.md`
- `scripts/contracts/audit_api_types_contract.py`
- `/home/fa507/Downloads/accessible-reader-api-types-contract-audit/`
- `/home/fa507/Downloads/accessible-reader-api-types-contract-audit-share.zip`

## Findings Snapshot

- OpenAPI paths: 58.
- OpenAPI operations: 66.
- OpenAPI schemas, excluding FastAPI validation schemas: 108.
- Backend Pydantic classes: 115.
- Backend Literal aliases: 19.
- Frontend API exports: 56.
- Frontend type exports: 100.
- Exact frontend/backend contract-name matches: 95.
- api.ts wrappers without matched backend route: 0.
- Backend routes without an `api.ts` wrapper or URL builder: 10, mostly browser/context-only, workspace admin/diagnostic support, preview asset download, and the older single-document route.

## Script

Run:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py
```

Behavior:

- Imports the local FastAPI app and reads `app.openapi()`.
- Parses `backend/app/models.py` with Python AST.
- Parses `frontend/src/api.ts` and `frontend/src/types.ts` with small stdlib regex/bracket helpers.
- Prints Markdown inventory to stdout.
- Does not write files unless stdout is redirected.
- Exits nonzero only when OpenAPI cannot be generated or required source files cannot be read.
- Reports drift without enforcing it.

## Validation Plan

- `cd /home/fa507/dev/accessible_reader && backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `git diff --check`

If the known `App.test.tsx` timing flake appears, rerun the focused failing test and one full frontend test run. Proceed only if the final full run passes.

## Recommendation

Primary next slice: add a contract drift CI/check lane and harden `scripts/contracts/audit_api_types_contract.py` into an expected-inventory check before splitting files.

After drift coverage exists, split `frontend/src/api.ts` by domain before `frontend/src/types.ts`. Defer generated TypeScript types until naming-only drift, inline request models, and frontend-friendly aliases are intentionally resolved.
