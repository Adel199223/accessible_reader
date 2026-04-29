# Stage 967 - Post-Stage-966 Add Content Import Collections Audit

## Status

Completed on April 28, 2026.

## Intent

Audit that collection-aware bulk import preserves archive structure, keeps Home collections durable, and retains the Stage 958-965 regression baselines.

## Scope

- Confirm Add Content preview shows deterministic collection suggestions from bookmark folders, Pocket CSV tags, and Pocket ZIP contents.
- Confirm selected batch apply creates or updates collections only for successfully imported or reused rows.
- Confirm Home custom collections persist through reload and still support manual create, rename, delete, and assignment.
- Confirm Study collection subsets and Graph tag filtering keep using persisted collection names.
- Preserve Stage 964 bulk import compatibility, Stage 958-963 export/preview/restore, Reader-led quiz launch, Study sessions/habits/attempts, Source overview memory/review/export, Home review signals, Notebook, Graph, Reader generated-output freeze, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `addContentBulkCollectionToggleVisible`
- `addContentBulkCollectionSuggestionsVisible`
- `addContentBulkCollectionImportCreatesCollection`
- `homeImportedCollectionVisible`
- `homeManualCollectionsPersistAfterReload`
- `studyImportedCollectionSubsetVisible`
- `graphImportedCollectionTagFilterMatches`
- retained `addContentBulkSelectedImportWorks`
- retained `homeWorkspaceBackupPreviewVisible`
- retained `readerStartSourceQuizStartsSession`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 966 implementation passes focused backend/frontend tests.
- Capture live browser evidence for collection-aware import and persisted Home collection behavior.
- Recheck Study subset and Graph tag visibility for imported collections.
- Run broad backend/frontend checks, cleanup dry-run, and `git diff --check`.

## Closeout Evidence

- `node scripts/playwright/stage967_post_stage966_add_content_import_collections_audit.mjs --base-url=http://127.0.0.1:8020` passed with collection-aware import evidence, Stage 964 bulk import compatibility, Reader-led quiz launch regression, source learning export/restore regression, and cleanup dry-run `matchedCount: 0`.
- Retained checks include `addContentBulkCollectionImportCreatesCollection`, `addContentPocketZipPreviewCollectionsVisible`, `homeManualCollectionsPersistAfterReload`, `studyImportedCollectionSubsetVisible`, `graphImportedCollectionTagFilterMatches`, `addContentBulkSelectedImportWorks`, `readerStartSourceQuizStartsSession`, `homeWorkspaceBackupPreviewVisible`, and `workspaceBackupRestoreActionVisible`.
- `git diff --check` passed after the Stage 967 audit.
