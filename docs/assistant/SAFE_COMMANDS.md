# Safe Commands

Use these exact commands first when you need low-risk setup or validation.

## Harness

```powershell
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && python3 tooling/check_harness_profile.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --json'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --write-state docs/assistant/runtime/BOOTSTRAP_STATE.json'
wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && python3 -c \"import json, pathlib; json.loads(pathlib.Path('docs/assistant/manifest.json').read_text()); print('manifest ok')\""
```

## Frontend

```powershell
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run'
```

## Backend

```powershell
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-adoptions'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -c "from app.main import app; print(app.title)"'
```

## Extension

```powershell
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/extension && npm test -- --run'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/extension && npm run build'
```
