# Stage 965 - Post-Stage-964 Add Content Bulk Import Queue Audit

## Status

Completed on April 28, 2026.

## Intent

Audit that bulk Add Content import is discoverable, preview-first, local-only, route-stable, and regression-safe after Stage 964.

## Scope

- Confirm Add Content exposes the new Bulk import mode beside existing Paste text, Web page, and Choose file modes.
- Confirm local bookmark/Pocket/URL-list uploads produce preview rows with ready/skipped/duplicate/invalid summaries before any import happens.
- Confirm importing selected ready rows reuses the existing saved-source pipeline and reports imported, reused, skipped, and failed rows without aborting the batch.
- Confirm existing single text, file, and URL imports remain unchanged.
- Preserve Stage 958-963 export/preview/restore flows, Reader-led quiz launch, Study sessions/habits/attempts, Source overview memory/review/export, Home review signals, Notebook, Graph, Reader generated-output freeze, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `addContentBulkImportModeVisible`
- `addContentBulkPreviewRowsVisible`
- `addContentBulkPreviewDryRun`
- `addContentBulkSelectedImportWorks`
- `addContentBulkImportResultVisible`
- `addContentSingleImportsStable`
- retained `homeWorkspaceBackupPreviewVisible`
- retained `sourceOverviewLearningPackExportLinkVisible`
- retained `readerStartSourceQuizStartsSession`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 964 implementation passes focused backend/frontend tests.
- Capture live browser evidence for Add Content bulk preview and selected import.
- Recheck Home source visibility and Reader reopen for an imported source.
- Run broad backend/frontend checks, cleanup dry-run, and `git diff --check`.

## Audit Evidence

- `node scripts/playwright/stage965_post_stage964_add_content_bulk_import_queue_audit.mjs --base-url=http://127.0.0.1:8011` passed on a fresh temporary backend.
- Add Content retained `addContentBulkImportModeVisible: true`, `addContentBulkPreviewRowsVisible: true`, `addContentBulkPreviewDryRun: true`, `addContentBulkSelectedImportWorks: true`, `addContentBulkImportResultVisible: true`, and `addContentSingleImportsStable: true`.
- Reader/source quiz regression retained `readerStartSourceQuizStartsSession: true`, `readerGenerateQuestionsDoesNotBlindGenerate: true`, `readerStudyQuestionsDoesNotStartSession: true`, and source scope/session progress evidence.
- Export/restore regression retained `homeWorkspaceBackupPreviewVisible: true`, `sourceOverviewLearningPackExportLinkVisible: true`, `workspaceBackupRestoreImportsMissingItems: true`, `workspaceBackupRestoreRestoresLearningPackState: true`, and attempt/session manifest payload evidence.
- Cleanup hygiene retained `cleanupUtilityDryRunMatchedAfterStage965: 0`.
- Backend/API, frontend App/API, typecheck, production build, and `git diff --check` passed in the Stage 964 validation ladder.
