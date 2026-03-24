# Project Harness Sync Workflow

## What This Workflow Is For

Apply the vendored harness source in `docs/assistant/templates/` to this repo's local harness files without changing product logic.

## Resolution-First Steps

1. validate `docs/assistant/HARNESS_PROFILE.json`
2. preview the resolved module/output set
3. write `docs/assistant/runtime/BOOTSTRAP_STATE.json`
4. update repo-local harness files
5. rerun the harness checks

## Primary Inputs

- `docs/assistant/HARNESS_PROFILE.json`
- `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- `docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json`
- `docs/assistant/templates/BOOTSTRAP_TEMPLATE_MAP.json`

## Minimal Commands

```powershell
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && python3 tooling/check_harness_profile.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json'
wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --write-state docs/assistant/runtime/BOOTSTRAP_STATE.json'
```

## Validation

- rerun preview with `--json` and require `missing_sync_targets: []`
- parse `docs/assistant/manifest.json` and confirm referenced harness paths exist
- keep repo-specific truths about the browser-first app, Edge companion, WSL toolchain, and opt-in AI intact
