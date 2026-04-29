# Stage 969 - Post-Stage-968 Library Collection Tree Audit

## Status

Completed on April 29, 2026.

## Intent

Audit that hierarchical local collections preserve imported bookmark structure, keep flat collection compatibility, and retain the Stage 958-967 export/import/Study/Reader/Home baselines.

## Scope

- Confirm bookmark folder previews show parent/child collection suggestions and apply creates parent plus leaf collections.
- Confirm parent Home boards aggregate descendant sources while leaf boards remain direct.
- Confirm create child, reparent, delete-with-child-promotion, and selected-source assignment persist through Library settings reload.
- Confirm Study subset rows and Graph `tag:` filtering include ancestor and direct collection names.
- Confirm learning packs and workspace backup/restore carry collection hierarchy through existing local settings payloads.
- Preserve Stage 966 Pocket ZIP/import collections, Stage 964 bulk import compatibility, Stage 958-963 export/preview/restore, Reader-led quiz launch, Study sessions/habits/attempts, Source overview memory/review/export, Home review signals, Notebook, Graph, Reader generated-output freeze, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `addContentBookmarkHierarchySuggestionsVisible`
- `addContentBookmarkHierarchyImportCreatesTree`
- `homeCollectionTreeRowsVisible`
- `homeCollectionCreateChildPersists`
- `homeCollectionReparentPersists`
- `homeCollectionDeletePromotesChildren`
- `homeParentCollectionAggregatesDescendants`
- `studyParentCollectionSubsetFiltersDescendants`
- `graphAncestorCollectionTagFilterMatches`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 968 implementation passes focused backend/frontend tests.
- Capture live browser evidence for Add Content hierarchy import, Home tree persistence, Study subset behavior, and Graph tag ancestry.
- Run broad backend/frontend checks, cleanup dry-run, and `git diff --check`.

## Completion Notes

- Stage 969 Playwright audit passed on a temporary current-code backend at `127.0.0.1:8023`.
- Captured bookmark hierarchy import, Home collection tree persistence, parent aggregation, Study/Graph collection behavior, Reader-led quiz regression, source learning export/restore regression, and cleanup dry-run `matchedCount: 0`.
