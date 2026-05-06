# QA Checks

## Harness

- `python3 tooling/check_harness_profile.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json`
- `python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --json`
- `python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --write-state docs/assistant/runtime/BOOTSTRAP_STATE.json`
- `python3 -c "import json, pathlib; json.loads(pathlib.Path('docs/assistant/manifest.json').read_text()); print('manifest ok')"`

## Product Validation

- frontend: `npm run lint`, `npm run build`, `npm test -- --run`
- contract drift: `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- OpenAPI snapshot: `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- generated OpenAPI reference: `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- generated type mapping: `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping`
- generated type adoptions: `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-adoptions`
- backend: `.venv/bin/python -m pytest`
- backend smoke: `.venv/bin/python -c "from app.main import app; print(app.title)"`
- extension: `npm test -- --run`, `npm run build`

## Browser Validation

- Windows Edge is the browser truth source
- use the repo-owned launcher for the live app
- use the unpacked extension flow when extension behavior is in scope
