# Accessible Reader Contract Drift Check Lane ExecPlan

## Status

Behavior-preserving contract drift hardening branch in progress on May 6, 2026. The follow-up verification lane wires the drift check into local pytest and assistant verification docs without changing runtime behavior.

## Intent

Turn the API/types contract audit into a lightweight local and CI-friendly drift check before any `api.ts`, `types.ts`, route, schema, or generated-type work.

## Scope

- Keep the existing Markdown audit output as the default script behavior.
- Add structured JSON output for tooling and artifacts.
- Add a narrow expected-inventory fixture for high-signal drift checks.
- Add a `--check` mode that fails only for OpenAPI/source-read failure, summary count drift, new unmatched frontend wrappers, or unreviewed backend-only route changes.
- Keep Neuro Map Studio status-only/read-only.

## Non-Goals

- Do not change backend schema, API route behavior, UI, storage, or generated Reader output.
- Do not split `frontend/src/api.ts` or `frontend/src/types.ts`.
- Do not add generated TypeScript types.
- Do not split backend models, storage, routes, CSS, or `RecallWorkspace.tsx`.
- Do not edit Neuro Map Studio.
- Do not update `docs/ROADMAP.md` or `docs/ROADMAP_ANCHOR.md`.

## Deliverables

- `scripts/contracts/audit_api_types_contract.py`
- `scripts/contracts/expected_api_types_contract.json`
- `docs/architecture/accessible-reader-api-types-contract-audit.md`
- `docs/exec_plans/active/accessible-reader-contract-drift-check-lane.md`
- `/home/fa507/Downloads/accessible-reader-contract-drift-check-lane/`
- `/home/fa507/Downloads/accessible-reader-contract-drift-check-lane-share.zip`

Verification lane follow-up:

- `backend/tests/test_contract_inventory.py`
- `docs/assistant/QA_CHECKS.md`
- `docs/assistant/SAFE_COMMANDS.md`
- `docs/assistant/manifest.json`
- `/home/fa507/Downloads/accessible-reader-contract-drift-verification-lane/`
- `/home/fa507/Downloads/accessible-reader-contract-drift-verification-lane-share.zip`

## Fixture Invariants

- Expected summary counts:
  - 58 OpenAPI paths.
  - 66 OpenAPI operations.
  - 108 OpenAPI schemas.
  - 115 backend Pydantic classes.
  - 19 backend Literal aliases.
  - 56 frontend API exports.
  - 100 frontend type exports.
  - 95 exact frontend/backend contract-name matches.
  - 0 api.ts wrappers without matched route.
  - 10 accepted backend routes without an `api.ts` wrapper or URL builder.
- Accepted backend-only routes must include a reason.
- Frontend wrappers without backend routes must remain empty.

## Script

Run:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check
```

## Validation Plan

- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json > /tmp/accessible_reader_contract_inventory.json`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `git diff --check`

If the known `App.test.tsx` timing flake appears, rerun the focused failing test and one full frontend test run. Proceed only if the final full run passes.

## Recommendation

After this check lane is stable, split `frontend/src/api.ts` by domain before splitting `frontend/src/types.ts`. Defer generated TypeScript types until naming-only drift, inline request models, and frontend-friendly aliases are intentionally resolved.
