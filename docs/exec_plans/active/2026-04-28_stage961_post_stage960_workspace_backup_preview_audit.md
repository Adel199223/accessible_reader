# Stage 961 - Post-Stage-960 Workspace Backup Preview Audit

## Status

Completed.

## Intent

Audit that workspace backup preview is discoverable, dry-run-only, portable, and regression-safe after Stage 960.

## Scope

- Confirm Home exposes workspace ZIP download plus backup preview upload.
- Confirm preview accepts a Stage 958/960 workspace ZIP and reports manifest metadata, entity counts, attempt/session counts, attachment coverage, learning-pack coverage, warnings, `dry_run: true`, and `applied: false`.
- Confirm raw `manifest.json` preview keeps the existing merge-preview semantics.
- Confirm malformed ZIP/JSON and ZIPs without `manifest.json` fail cleanly without mutation.
- Preserve Stage 958 source learning-pack exports, Source overview export actions, Stage 956 Reader-led quiz launch, Study sessions/attempts/habits, Home review signals, Reader generated-output freeze, Notebook, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `homeWorkspaceBackupPreviewVisible`
- `homeWorkspaceBackupPreviewAcceptsZip`
- `homeWorkspaceBackupPreviewAcceptsManifest`
- `workspaceBackupPreviewDryRun`
- `workspaceBackupPreviewAppliedFalse`
- `workspaceBackupPreviewIncludesLearningPacks`
- `workspaceBackupPreviewIncludesAttachmentCoverage`
- `workspaceBackupPreviewIncludesAttemptAndSessionEntities`
- `workspaceBackupPreviewInvalidZipRejected`
- retained `sourceOverviewLearningPackExportVisible`
- retained `readerStartSourceQuizStartsSession`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 960 implementation passes focused backend/frontend tests.
- Capture live browser evidence for Home backup preview and workspace export surfaces.
- Fetch/export a workspace ZIP through the live API, preview it through the UI/API, and confirm no storage mutation.
- Run broad backend/frontend checks, cleanup dry-run, and `git diff --check`.

## Completion Evidence

- Captured Stage 961 regression evidence in `output/playwright/stage961-post-stage960-workspace-backup-preview-audit-validation.json`.
- Verified backup preview accepts exported ZIP and raw manifest JSON, reports dry-run/applied-false state, includes learning-pack and attachment coverage, includes `study_answer_attempt` and `study_review_session` counts, and rejects invalid ZIP input.
- Reconfirmed retained Stage 958 learning-pack exports, Source overview export actions, Stage 956 Reader-led source quiz launch paths, Study session/progress baselines, Home review signals, Reader generated-output freeze, Source overview memory/review, and cleanup dry-run `matchedCount: 0`.
