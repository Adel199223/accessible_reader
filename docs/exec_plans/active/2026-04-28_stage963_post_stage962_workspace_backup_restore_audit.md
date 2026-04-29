# Stage 963 - Post-Stage-962 Workspace Backup Restore Audit

## Status

Completed on April 28, 2026.

## Intent

Audit that workspace backup restore is discoverable, guarded, additive-only, and regression-safe after Stage 962.

## Scope

- Confirm current workspace ZIP exports include `workspace-data.json` while retaining manifest, attachments, and learning packs.
- Confirm Home backup preview reports restorable state for new ZIPs and preview-only blockers for raw manifests or old ZIPs.
- Confirm guarded restore imports missing sources, notes, graph memory, Study cards, attempts, sessions, settings, and attachments without overwriting local conflicts.
- Confirm restore refreshes Home, Source overview, Study, Notebook, Graph, and export counts.
- Preserve Stage 960 preview, Stage 958 learning-pack export, Source overview export actions, Stage 956 Reader-led quiz launch, Study sessions/attempts/habits, Home review signals, Reader generated-output freeze, Notebook, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `workspaceZipIncludesDataPayload`
- `workspaceBackupPreviewZipCanApplyAfterDelete`
- `workspaceBackupPreviewBlocksManifestApply`
- `workspaceBackupRestoreActionVisible`
- `workspaceBackupRestoreResultVisible`
- `workspaceBackupRestoreImportsMissingItems`
- `workspaceBackupRestoreRestoresLearningPackState`
- `workspaceBackupRestoreRestoresProgress`
- retained `homeWorkspaceBackupPreviewVisible`
- retained `sourceOverviewLearningPackExportLinkVisible`
- retained `readerStartSourceQuizStartsSession`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 962 implementation passes focused backend/frontend tests.
- Capture live browser evidence for Home backup preview and restore.
- Fetch/export a workspace ZIP through the live API, restore it into a second empty workspace, and verify restored learning/source state.
- Run broad backend/frontend checks, cleanup dry-run, and `git diff --check`.

## Validation Evidence

- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage963_post_stage962_workspace_backup_restore_audit.mjs --base-url=http://127.0.0.1:8000'` - passed with backup restore, source learning export, Reader-led quiz launch regression, restored source learning state in a temporary empty workspace, and cleanup dry-run `matchedCount: 0`.
- Stage 962 broad validation remained green: backend `tests/test_api.py` 81 passed, frontend typecheck passed, `src/api.test.ts` plus full `src/App.test.tsx` 158 passed, and `npm run build` passed with the existing Vite chunk-size warning.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` - passed.

## Outcome

Stage 962/963 closes the local backup ownership loop for this slice: exported ZIPs now carry restorable data payloads, previews clearly distinguish preview-only and restorable bundles, Home exposes only a guarded missing-item restore action, restore stays additive/non-destructive, and the audit confirms existing Source export, Reader-led Study handoff, Study session history, and cleanup hygiene baselines remain intact.
