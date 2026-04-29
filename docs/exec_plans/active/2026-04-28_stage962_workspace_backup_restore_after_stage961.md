# Stage 962 - Workspace Backup Restore After Stage 961

## Status

Completed on April 28, 2026.

## Intent

Turn Stage 960 backup preview into a safe local restore path for missing workspace data while keeping the restore model additive, explicit, and non-destructive.

## Scope

- Extend workspace ZIP export with `workspace-data.json` while preserving `manifest.json`, attachments, and `sources/*/learning-pack.md`.
- Keep raw `manifest.json` files preview-only; allow restore only from ZIP bundles with `workspace-data.json`.
- Add guarded `POST /api/workspace/import-apply` with multipart ZIP upload plus explicit restore confirmation.
- Restore only missing data and skip equal, local-newer, and conflicting entities without overwriting or deleting local records.
- Restore sources, variants/chunks/search text, notes, graph memory, Study cards, review events, attempts, sessions, app settings, and bundled attachments.
- Rebuild local derived indexes after apply and return imported/skipped/conflict counts plus blockers/warnings.
- Extend Home backup preview with restorable/readiness state and a guarded restore action only after a restorable ZIP preview.
- Preserve existing export/preview/merge-preview routes, Source overview exports, Reader-led quiz launch, Study sessions/attempts/habits, Reader generated-output freeze, Notebook, Graph, Add Content, FSRS semantics, and cleanup hygiene.

## Validation Plan

- Backend coverage for payload presence, apply readiness, manifest/old-ZIP blockers, empty-workspace restore, non-empty additive restore, conflict preservation, invalid restore no-mutation, and existing export/preview compatibility.
- Frontend coverage for Home restorable vs preview-only state, guarded restore action, apply request body, result counts, and refresh behavior.
- Stage 962 Playwright evidence for preview, restore, restored learning state, and cleanup dry-run `matchedCount: 0`.
- Broad backend/frontend validation, Stage 963 audit evidence, build/typecheck, and `git diff --check`.

## Completed Changes

- Added `workspace-data.json` to workspace ZIP exports without removing `manifest.json`, attachments, or source learning packs.
- Added guarded dry-run/apply readiness to import preview and a new multipart `POST /api/workspace/import-apply` endpoint that requires `restore_confirmation=restore-missing-items`.
- Implemented additive-only restore for missing portable rows and bundled attachments across sources, variants, chunks, reading sessions, notes, graph memory, Study cards, review events, attempts, sessions, app settings, and derived index rebuild/integrity reporting.
- Kept raw manifest uploads preview-only and blocked old ZIPs without `workspace-data.json` from restore.
- Extended Home's workspace backup panel with restorable/readiness state, guarded restore action, and imported/skipped/conflict result counts.
- Extended backend/frontend tests and Playwright evidence to cover preview, restore, and restored learning state through a temporary empty workspace.

## Validation Evidence

- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest tests/test_api.py -q'` - 81 passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'` - passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/api.test.ts src/App.test.tsx --reporter=dot'` - 158 passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` - passed with the existing Vite chunk-size warning.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/source_learning_exports_shared.mjs && node --check scripts/playwright/workspace_backup_restore_server_shared.mjs && node --check scripts/playwright/stage962_workspace_backup_restore_after_stage961.mjs && node --check scripts/playwright/stage963_post_stage962_workspace_backup_restore_audit.mjs'` - passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage962_workspace_backup_restore_after_stage961.mjs --base-url=http://127.0.0.1:8000'` - passed with ZIP payload, Home restore, temporary empty-workspace apply, restored learning state, and cleanup dry-run `matchedCount: 0`.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` - passed.
