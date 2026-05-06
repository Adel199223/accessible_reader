# Accessible Reader API/Types Contract Audit

Date: May 4, 2026

Branch: `accessible-reader-api-types-contract-audit`

Base: `28cc838a1bbee34b36e7669be86f311a1437d3d0`

## Summary

This audit compares the FastAPI/OpenAPI/Pydantic contract with the frontend API and TypeScript contract layer. It is behavior-preserving: no backend schema, route behavior, UI, runtime API client shape, or generated TypeScript type output changed in this slice.

The new check-only script is `scripts/contracts/audit_api_types_contract.py`. It imports the local FastAPI app, reads `app.openapi()`, parses `backend/app/models.py`, the `frontend/src/api.ts` API barrel plus `frontend/src/api/*.ts`, and the `frontend/src/types.ts` type barrel plus `frontend/src/types/*.ts` with stdlib-only AST/regex helpers, and prints Markdown to stdout. It does not write files unless the caller redirects stdout. It exits nonzero only when OpenAPI cannot be generated or required source files cannot be read; drift findings are report-only for now.

Current script snapshot:

- OpenAPI paths: 58
- OpenAPI route operations: 66
- OpenAPI schemas, excluding FastAPI validation schemas: 108
- Backend Pydantic classes: 115
- Backend Literal aliases: 19
- Frontend API exports: 56
- Frontend type exports: 100
- Exact frontend/backend contract-name matches: 95
- API wrappers without matched backend route: 0
- Backend routes without an `api.ts` wrapper or URL builder: 10

Conclusion: the stack does not need modernization, but contract drift coverage should stay green while the frontend API and type barrels move domain implementation details into smaller modules.

## Contract Drift Check Lane

The follow-up check lane keeps the audit behavior-preserving while making drift visible in a local/CI-friendly command.

Commands:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --format json
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check
```

Behavior:

- Default output remains Markdown inventory printed to stdout.
- `--format json` prints the same inventory as structured JSON to stdout.
- `--check` reads `scripts/contracts/expected_api_types_contract.json` and fails only when OpenAPI/source reads fail, summary counts drift, a frontend wrapper loses its backend route match, or the accepted backend-only route list changes without review.
- The expected fixture intentionally records only high-signal invariants: summary counts, zero unmatched frontend wrappers, and the accepted backend routes without `api.ts` wrappers or URL builders.
- The fixture is not generated TypeScript, not a schema migration, and not a runtime product contract.

The check is now wired into local verification through `backend/tests/test_contract_inventory.py`, so `cd backend && .venv/bin/python -m pytest tests/test_contract_inventory.py -q` runs the same fixture-backed drift guard. The repo assistant docs also expose the command as a safe backend check and as the `contract_drift_check` manifest command for future API/schema/frontend contract work.

The frontend API client is now split by route/domain under `frontend/src/api/`, while `frontend/src/api.ts` remains the stable public barrel for existing imports. The audit script follows both the barrel and the domain modules, so `--check` continues to guard the same wrapper inventory after the split.

The frontend type contract is now split by domain under `frontend/src/types/`, while `frontend/src/types.ts` remains the stable public barrel for existing imports. The audit script follows both the barrel and the domain modules, so `--check` continues to guard the same 100 exported type/interface inventory after the split.

The generated-type feasibility follow-up added a normalized OpenAPI snapshot lane before generated TypeScript adoption:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --openapi-snapshot
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot
```

The snapshot fixture records OpenAPI version, schema names, route operation keys, multipart/download exceptions, frontend/backend name gaps, backend Literal aliases not emitted as OpenAPI schemas, and the compatibility alias map. It is wired into `backend/tests/test_contract_inventory.py` beside the original contract drift check.

The follow-up generated-reference lane adds one private TypeScript reference file without changing runtime imports:

```bash
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --write-generated-openapi-reference
backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference
```

The command uses local FastAPI OpenAPI output and `openapi-typescript` to maintain `frontend/src/generated/openapi.ts` as a deterministic reference artifact. The file is not exported from the public frontend type barrel and is not imported by product code. The check is wired into `backend/tests/test_contract_inventory.py` and guards expected anchors for `paths`, `components`, `operations`, core records, awkward request/body shapes, multipart body aliases, and validation schemas.

## Backend Route Inventory

The OpenAPI surface is broad but coherent. Most routes are JSON. The non-JSON cases are intentional import/export/browser behaviors.

Behavior counts:

- JSON: 55 operations
- Form/upload: 5 operations
- Stream/download: 4 operations
- File/download: 2 operations

Routes grouped by domain:

- Browser context (2): `POST /api/recall/browser/context` [json]; `POST /api/recall/browser/notes` [json]
- Documents (3): `GET /api/documents` [json]; `DELETE /api/documents/{document_id}` [json]; `GET /api/documents/{document_id}` [json]
- Graph (4): `GET /api/recall/graph` [json]; `POST /api/recall/graph/edges/{edge_id}/decision` [json]; `GET /api/recall/graph/nodes/{node_id}` [json]; `POST /api/recall/graph/nodes/{node_id}/decision` [json]
- Health (1): `GET /api/health` [json]
- Import (5): `POST /api/documents/import-batch` [form/upload]; `POST /api/documents/import-batch-preview` [form/upload]; `POST /api/documents/import-file` [form/upload]; `POST /api/documents/import-text` [json]; `POST /api/documents/import-url` [json]
- Library/collections (5): `GET /api/recall/library/collections/{collection_id}/learning-export.zip` [stream/download]; `GET /api/recall/library/collections/{collection_id}/overview` [json]; `GET /api/recall/library/reading-queue` [json]; `GET /api/recall/library/settings` [json]; `PUT /api/recall/library/settings` [json]
- Reader views (3): `PUT /api/documents/{document_id}/progress` [json]; `POST /api/documents/{document_id}/transform` [json]; `GET /api/documents/{document_id}/view` [json]
- Recall documents (9): `GET /api/recall/documents` [json]; `GET /api/recall/documents/{document_id}` [json]; `GET /api/recall/documents/{document_id}/export.md` [stream/download]; `GET /api/recall/documents/{document_id}/learning-export.md` [stream/download]; `GET /api/recall/documents/{document_id}/notes` [json]; `POST /api/recall/documents/{document_id}/notes` [json]; `GET /api/recall/documents/{document_id}/preview` [json]; `GET /api/recall/documents/{document_id}/preview/asset` [file/download]; `POST /api/recall/documents/{document_id}/reading/complete` [json]
- Recall notes (5): `GET /api/recall/notes/search` [json]; `DELETE /api/recall/notes/{note_id}` [json]; `PATCH /api/recall/notes/{note_id}` [json]; `POST /api/recall/notes/{note_id}/promote/graph-node` [json]; `POST /api/recall/notes/{note_id}/promote/study-card` [json]
- Search/retrieval (2): `GET /api/recall/retrieve` [json]; `GET /api/recall/search` [json]
- Settings/progress (2): `GET /api/settings` [json]; `PUT /api/settings` [json]
- Study (15): `GET /api/recall/study/cards` [json]; `POST /api/recall/study/cards` [json]; `POST /api/recall/study/cards/bulk-delete` [json]; `POST /api/recall/study/cards/generate` [json]; `DELETE /api/recall/study/cards/{card_id}` [json]; `PATCH /api/recall/study/cards/{card_id}` [json]; `POST /api/recall/study/cards/{card_id}/attempts` [json]; `POST /api/recall/study/cards/{card_id}/review` [json]; `POST /api/recall/study/cards/{card_id}/schedule-state` [json]; `GET /api/recall/study/overview` [json]; `GET /api/recall/study/progress` [json]; `POST /api/recall/study/sessions` [json]; `POST /api/recall/study/sessions/{session_id}/complete` [json]; `GET /api/recall/study/settings` [json]; `PUT /api/recall/study/settings` [json]
- Workspace import/export (10): `GET /api/workspace/attachments` [json]; `GET /api/workspace/attachments/{attachment_id}` [file/download]; `GET /api/workspace/change-events` [json]; `GET /api/workspace/export.manifest.json` [json]; `GET /api/workspace/export.zip` [stream/download]; `POST /api/workspace/import-apply` [form/upload]; `POST /api/workspace/import-preview` [form/upload]; `GET /api/workspace/integrity` [json]; `POST /api/workspace/merge-preview` [json]; `POST /api/workspace/repair` [json]

## Frontend API Wrapper Inventory

`frontend/src/api.ts` currently exports 56 functions. The audit script matched every wrapper to a backend route or URL builder target.

Wrappers grouped by domain:

- Documents (2): `fetchDocuments -> GET /api/documents`; `deleteDocumentRecord -> DELETE /api/documents/{documentId}`
- Graph (4): `fetchRecallGraph -> GET /api/recall/graph`; `fetchRecallGraphNode -> GET /api/recall/graph/nodes/{nodeId}`; `decideRecallGraphNode -> POST /api/recall/graph/nodes/{nodeId}/decision`; `decideRecallGraphEdge -> POST /api/recall/graph/edges/{edgeId}/decision`
- Health (1): `fetchHealth -> GET /api/health`
- Import (5): `importTextDocument -> POST /api/documents/import-text`; `importFileDocument -> POST /api/documents/import-file`; `importUrlDocument -> POST /api/documents/import-url`; `previewBatchImport -> POST /api/documents/import-batch-preview`; `importBatchDocuments -> POST /api/documents/import-batch`
- Library/collections (5): `buildLibraryCollectionLearningPackExportUrl -> URL /api/recall/library/collections/{collectionId}/learning-export.zip`; `fetchLibraryCollectionOverview -> GET /api/recall/library/collections/{collectionId}/overview`; `fetchLibraryReadingQueue -> GET /api/recall/library/reading-queue`; `fetchLibrarySettings -> GET /api/recall/library/settings`; `saveLibrarySettings -> PUT /api/recall/library/settings`
- Reader views (3): `fetchDocumentView -> GET /api/documents/{documentId}/view`; `generateDocumentView -> POST /api/documents/{documentId}/transform`; `saveProgress -> PUT /api/documents/{documentId}/progress`
- Recall documents (8): `fetchRecallDocuments -> GET /api/recall/documents`; `fetchRecallDocument -> GET /api/recall/documents/{documentId}`; `fetchRecallDocumentPreview -> GET /api/recall/documents/{documentId}/preview`; `fetchRecallNotes -> GET /api/recall/documents/{documentId}/notes`; `createRecallNote -> POST /api/recall/documents/{documentId}/notes`; `buildRecallExportUrl -> URL /api/recall/documents/{documentId}/export.md`; `buildRecallLearningPackExportUrl -> URL /api/recall/documents/{documentId}/learning-export.md`; `completeRecallDocumentReading -> POST /api/recall/documents/{documentId}/reading/complete`
- Recall notes (5): `updateRecallNote -> PATCH /api/recall/notes/{noteId}`; `deleteRecallNote -> DELETE /api/recall/notes/{noteId}`; `promoteRecallNoteToGraphNode -> POST /api/recall/notes/{noteId}/promote/graph-node`; `promoteRecallNoteToStudyCard -> POST /api/recall/notes/{noteId}/promote/study-card`; `searchRecallNotes -> GET /api/recall/notes/search`
- Search/retrieval (2): `searchRecall -> GET /api/recall/search`; `retrieveRecall -> GET /api/recall/retrieve`
- Settings/progress (2): `fetchSettings -> GET /api/settings`; `saveSettings -> PUT /api/settings`
- Study (15): `fetchRecallStudyOverview -> GET /api/recall/study/overview`; `fetchRecallStudySettings -> GET /api/recall/study/settings`; `saveRecallStudySettings -> PUT /api/recall/study/settings`; `fetchRecallStudyProgress -> GET /api/recall/study/progress`; `fetchRecallStudyCards -> GET /api/recall/study/cards`; `startRecallStudyReviewSession -> POST /api/recall/study/sessions`; `completeRecallStudyReviewSession -> POST /api/recall/study/sessions/{sessionId}/complete`; `createRecallStudyCard -> POST /api/recall/study/cards`; `generateRecallStudyCards -> POST /api/recall/study/cards/generate`; `createRecallStudyAnswerAttempt -> POST /api/recall/study/cards/{cardId}/attempts`; `reviewRecallStudyCard -> POST /api/recall/study/cards/{cardId}/review`; `updateRecallStudyCard -> PATCH /api/recall/study/cards/{cardId}`; `deleteRecallStudyCard -> DELETE /api/recall/study/cards/{cardId}`; `bulkDeleteRecallStudyCards -> POST /api/recall/study/cards/bulk-delete`; `setRecallStudyCardScheduleState -> POST /api/recall/study/cards/{cardId}/schedule-state`
- Workspace import/export (4): `buildWorkspaceExportUrl -> URL /api/workspace/export.zip`; `fetchWorkspaceExportManifest -> GET /api/workspace/export.manifest.json`; `previewWorkspaceImport -> POST /api/workspace/import-preview`; `applyWorkspaceImport -> POST /api/workspace/import-apply`

Special wrapper behavior:

- FormData wrappers cover document file import, batch import preview/apply, and workspace import preview/apply.
- URL builder wrappers cover recall markdown export, recall learning pack export, library collection learning pack export, and workspace export.
- Query string wrappers cover document list/search, recall note/search/retrieval, graph limits, study cards/progress, and library reading queue.
- `fetchRecallDocumentPreview` normalizes preview asset URLs returned by the backend rather than exposing a direct asset wrapper.
- Several request bodies are intentionally inline in `api.ts` even though backend request models exist: graph decisions, study review, study schedule state, bulk study delete, transform/progress, text/url import, and reading-complete defaults.

## Frontend Type Inventory

`frontend/src/types.ts` exports 100 public types/interfaces. The script found 95 exact contract-name matches against backend OpenAPI schema names or backend Literal aliases. The remaining items are expected frontend aliases, UI helpers, or naming-only contract mirrors.

Types grouped by domain:

- Documents (3): `DocumentRecord`, `RecallDocumentRecord`, `RecallDocumentPreview`
- Graph (7): `RecallNoteGraphPromotionRequest`, `GraphReviewStatus`, `KnowledgeNodeRecord`, `KnowledgeEdgeRecord`, `KnowledgeMentionRecord`, `KnowledgeNodeDetail`, `KnowledgeGraphSnapshot`
- Import (10): `BatchResolvedImportFormat`, `BatchImportFormat`, `BatchImportCollectionSuggestion`, `BatchImportPreviewRow`, `BatchImportPreviewSummary`, `BatchImportPreview`, `BatchImportCollectionResult`, `BatchImportResultRow`, `BatchImportResultSummary`, `BatchImportResult`
- Library/collections (17): `LibraryCollection`, `LibrarySettings`, `LibraryCollectionPathItem`, `LibraryCollectionMemoryCounts`, `LibraryCollectionStudyCounts`, `LibraryCollectionRecentSource`, `LibraryCollectionRecentActivity`, `LibraryCollectionReadingSummary`, `LibraryCollectionResumeSource`, `LibraryCollectionHighlightReviewItem`, `LibraryCollectionOverview`, `LibraryReadingQueueScope`, `LibraryReadingQueueState`, `LibraryReadingQueueSummary`, `LibraryReadingQueueStudyCounts`, `LibraryReadingQueueRow`, `LibraryReadingQueueResponse`
- Reader views (3): `ViewBlock`, `DocumentView`, `ReaderSessionState`
- Recall documents (1): `ReadingCompleteResult`
- Recall notes (5): `RecallNoteAnchor`, `RecallNoteRecord`, `RecallNoteCreateRequest`, `RecallNoteUpdateRequest`, `RecallNoteSearchHit`
- Search/retrieval (3): `RecallSearchHit`, `RetrievalHitType`, `RecallRetrievalHit`
- Settings/progress (3): `ReaderSettings`, `AccessibilitySnapshot`, `HealthResponse`
- Study (37): `RecallNoteStudyPromotionRequest`, `StudyCardUpdateRequest`, `StudyKnowledgeStage`, `StudyCardStatus`, `StudyReviewRating`, `StudyCardRecord`, `StudyManualCardType`, `StudyGeneratedCardType`, `StudyQuestionDifficulty`, `StudyQuestionDifficultyFilter`, `StudyCardChoiceOption`, `StudyCardMatchingPair`, `StudyCardOrderingItem`, `StudyCardQuestionPayload`, `StudyCardSupportPayload`, `StudyCardCreateRequest`, `StudyCardDeleteResult`, `StudyCardBulkDeleteResult`, `StudyOverview`, `StudyReviewProgressDay`, `StudyReviewProgressRatingCount`, `StudyReviewProgressStageCount`, `StudyReviewProgressStageSnapshot`, `StudyReviewProgressRecentReview`, `StudyReviewProgressSource`, `StudyReviewProgressDifficulty`, `StudyReviewGoalHistoryRow`, `StudyReviewGoalStatus`, `StudyReviewSessionRecord`, `StudySettings`, `StudyReviewSessionStartRequest`, `StudyReviewSessionCompleteRequest`, `StudyAnswerAttemptRequest`, `StudyAnswerAttemptRecord`, `StudyReviewProgress`, `StudyCardGenerationResult`, `StudyCardGenerationRequest`
- Workspace import/export (9): `PortableEntityDigest`, `AttachmentRef`, `WorkspaceExportManifest`, `WorkspaceMergeOperation`, `WorkspaceMergePreview`, `WorkspaceImportPreviewSummary`, `WorkspaceImportPreview`, `WorkspaceIntegrityReport`, `WorkspaceImportApplyResult`
- Other/naming aliases (2): `ViewMode`, `SummaryDetail`

## Backend Model Inventory

`backend/app/models.py` contains 115 Pydantic classes and 19 Literal aliases. Several storage/internal domain classes are not emitted as OpenAPI components because they are repository/service shapes rather than route request/response models.

Models grouped by domain:

- Browser context (4): `BrowserSavedPageMatch`, `BrowserContextRequest`, `BrowserContextResponse`, `BrowserRecallNoteCreateRequest`
- Documents (6): `SourceDocument`, `DocumentVariant`, `ContentChunk`, `RecallDocumentPreview`, `DocumentRecord`, `RecallDocumentRecord`
- Graph (11): `EntityMention`, `KnowledgeNode`, `RelationEvidence`, `KnowledgeEdge`, `RecallNoteGraphPromotionRequest`, `KnowledgeNodeRecord`, `KnowledgeEdgeRecord`, `KnowledgeMentionRecord`, `KnowledgeNodeDetail`, `KnowledgeGraphSnapshot`, `GraphDecisionRequest`
- Import (10): `ImportTextRequest`, `ImportUrlRequest`, `BatchImportCollectionSuggestion`, `BatchImportPreviewRow`, `BatchImportPreviewSummary`, `BatchImportPreview`, `BatchImportCollectionResult`, `BatchImportResultRow`, `BatchImportResultSummary`, `BatchImportResult`
- Library/collections (15): `LibraryCollection`, `LibrarySettings`, `LibraryCollectionPathItem`, `LibraryCollectionMemoryCounts`, `LibraryCollectionStudyCounts`, `LibraryCollectionRecentSource`, `LibraryCollectionRecentActivity`, `LibraryCollectionReadingSummary`, `LibraryCollectionResumeSource`, `LibraryCollectionHighlightReviewItem`, `LibraryCollectionOverview`, `LibraryReadingQueueSummary`, `LibraryReadingQueueStudyCounts`, `LibraryReadingQueueRow`, `LibraryReadingQueueResponse`
- Reader views (5): `ViewBlock`, `DocumentView`, `ReaderSessionState`, `TransformRequest`, `ProgressUpdate`
- Recall documents (2): `ReadingCompleteRequest`, `ReadingCompleteResult`
- Recall notes (5): `RecallNoteAnchor`, `RecallNoteRecord`, `RecallNoteCreateRequest`, `RecallNoteUpdateRequest`, `RecallNoteSearchHit`
- Search/retrieval (3): `RetrievalHit`, `RecallSearchHit`, `RecallRetrievalHit`
- Settings/progress (3): `AccessibilitySnapshot`, `ReaderSettings`, `HealthResponse`
- Study (35): `ReviewCard`, `ReviewEvent`, `RecallNoteStudyPromotionRequest`, `StudyCardChoiceOption`, `StudyCardMatchingPair`, `StudyCardOrderingItem`, `StudyCardQuestionPayload`, `StudyCardSupportPayload`, `StudyCardRecord`, `StudyOverview`, `StudyReviewProgressDay`, `StudyReviewProgressRatingCount`, `StudyReviewProgressStageCount`, `StudyReviewProgressStageSnapshot`, `StudyReviewProgressRecentReview`, `StudyReviewProgressSource`, `StudyReviewProgressDifficulty`, `StudyReviewGoalHistoryRow`, `StudyReviewGoalStatus`, `StudyReviewSessionRecord`, `StudyReviewProgress`, `StudyAnswerAttemptRequest`, `StudyAnswerAttemptRecord`, `StudyCardGenerationResult`, `StudyCardGenerationRequest`, `StudyReviewRequest`, `StudyScheduleStateRequest`, `StudySettings`, `StudyReviewSessionStartRequest`, `StudyReviewSessionCompleteRequest`, `StudyCardCreateRequest`, `StudyCardUpdateRequest`, `StudyCardDeleteResult`, `StudyCardBulkDeleteRequest`, `StudyCardBulkDeleteResult`
- Workspace import/export (15): `AttachmentRef`, `ChangeEvent`, `WorkspaceChangeLogPage`, `WorkspaceIntegrityIssue`, `WorkspaceIntegrityReport`, `WorkspaceRepairResult`, `PortableEntityDigest`, `WorkspaceExportManifest`, `WorkspaceDataPayload`, `WorkspaceMergePreviewRequest`, `WorkspaceMergeOperation`, `WorkspaceMergePreview`, `WorkspaceImportPreviewSummary`, `WorkspaceImportPreview`, `WorkspaceImportApplyResult`
- Other/internal (1): `ReadingSession`

Model notes from the script:

- Defaults and optional fields are widespread, especially workspace import/export, library/collections, study progress, generated study payloads, and preview/collection summaries.
- Literal aliases and literal fields define important vocabularies: document/view modes, import formats, collection/queue states, graph review status, study status, study review ratings, knowledge stages, generated/manual question types, workspace integrity severities, and merge/import states.
- Backend-only internal classes such as `SourceDocument`, `DocumentVariant`, `ContentChunk`, `EntityMention`, `KnowledgeNode`, `KnowledgeEdge`, `ReviewCard`, `ReviewEvent`, `WorkspaceDataPayload`, and `ReadingSession` should not be forced into frontend types unless they become route contracts.

## Drift Matrix

Exact matches:

- The current frontend/backend contract-name overlap is strong: 95 exact matches across document records, reader views, recall notes, graph records/snapshots, study cards/progress/session/attempts, library collections, workspace import/export, settings, accessibility, and health.

Naming-only or inline matches:

| Backend contract | Frontend or api.ts representation |
| --- | --- |
| `DocumentMode` | `ViewMode` |
| `DetailLevel` | `SummaryDetail` |
| `SourceDocument` | `DocumentRecord` / `RecallDocumentRecord` |
| `GraphDecisionRequest` | inline decision payload in `api.ts` |
| `StudyReviewRequest` | `StudyReviewRating` plus optional `attemptId` |
| `StudyScheduleStateRequest` | inline schedule/unschedule action |
| `StudyCardBulkDeleteRequest` | `bulkDeleteRecallStudyCards(cardIds)` |
| `ImportTextRequest` | `importTextDocument(text, title)` |
| `ImportUrlRequest` | `importUrlDocument(url)` |
| `TransformRequest` | `generateDocumentView(documentId, mode, detailLevel)` |
| `ProgressUpdate` | `saveProgress(documentId, mode, sentenceIndex, options)` |
| `ReadingCompleteRequest` | `completeRecallDocumentReading(documentId, mode)` |

Backend route schemas missing frontend type names:

- Generated multipart body schemas: `Body_apply_workspace_import_api_workspace_import_apply_post`, `Body_import_document_batch_api_documents_import_batch_post`, `Body_import_file_api_documents_import_file_post`, `Body_preview_document_batch_import_api_documents_import_batch_preview_post`, `Body_preview_workspace_import_api_workspace_import_preview_post`
- Browser extension/context-only contracts: `BrowserContextRequest`, `BrowserContextResponse`, `BrowserRecallNoteCreateRequest`, `BrowserTriggerMode`
- Backend request models represented inline in `api.ts`: `GraphDecisionRequest`, `ImportTextRequest`, `ImportUrlRequest`, `ProgressUpdate`, `ReadingCompleteRequest`, `StudyCardBulkDeleteRequest`, `StudyReviewRequest`, `StudyScheduleStateRequest`, `TransformRequest`
- Backend aliases that intentionally map to frontend names or local unions: `BatchImportApplyStatus`, `BatchImportPreviewStatus`, `BlockKind`, `DetailLevel`, `DocumentMode`, `LibraryCollectionOrigin`, `StudyReviewRatingLabel`, `StudyStreakGoalMode`
- Workspace admin/diagnostic shapes without app wrappers today: `WorkspaceChangeLogPage`, `WorkspaceMergePreviewRequest`, `WorkspaceRepairResult`

Frontend types without backend names:

- `RetrievalHitType`: frontend readability alias for retrieval hit type handling.
- `StudyGeneratedCardType`: frontend alias over generated/manual study payload presentation.
- `StudyReviewRating`: frontend rating vocabulary mirror for backend `StudyReviewRatingLabel`.

api.ts wrappers without backend route:

- None found by the check-only script.

Backend routes without api.ts wrapper or URL builder:

- `GET /api/documents/{document_id}`: route exists, while the app mostly uses list/detail recall document and reader view wrappers.
- `POST /api/recall/browser/context`: extension/context-only.
- `POST /api/recall/browser/notes`: extension/context-only.
- `GET /api/recall/documents/{document_id}/preview/asset`: intentionally reached through normalized preview asset URLs rather than a direct wrapper.
- `GET /api/workspace/attachments`: workspace admin/export support route.
- `GET /api/workspace/attachments/{attachment_id}`: file/download support route.
- `GET /api/workspace/change-events`: workspace change log support route.
- `GET /api/workspace/integrity`: workspace diagnostic support route.
- `POST /api/workspace/merge-preview`: workspace admin/import planning support route.
- `POST /api/workspace/repair`: workspace repair support route.

Intentional browser/form/download cases:

- Multipart imports: document file import, batch import preview/apply, workspace import preview/apply.
- Download URLs: recall markdown export, recall learning pack export, library collection learning pack export, workspace export zip.
- File asset URLs: recall document preview asset and workspace attachment download.
- Browser context routes: extension/context-only and not part of the browser app's main API wrapper surface today.

Human-review cases:

- The v0 script is a regex/AST inventory, not a full TypeScript compiler or OpenAPI type generator. It should be used as an audit lane before enforcement.
- Multipart request body schema names are generated by FastAPI and are not useful frontend type names.
- Inline request bodies are not wrong, but they are the most likely long-term drift points.
- The `DocumentMode -> ViewMode` and `DetailLevel -> SummaryDetail` naming differences are stable but should be called out before any generated-type adoption.
- Future NeuroMap compatibility should depend on explicit contracts for source documents, graph nodes/edges, study card/event/session shapes, collections, notes/evidence, graph review status, and rating vocabulary, not on implicit naming similarity.

## Recommendation

Primary next slice: review the now-split API and type barrels under routine product work before introducing generated TypeScript types.

Suggested next steps:

1. Keep `frontend/src/api.ts` and `frontend/src/types.ts` as compatibility barrels while domain modules carry the implementation.
2. Keep `contract_drift_check` green for any future API/schema/frontend contract slice.
3. Defer generated TypeScript types from OpenAPI until naming-only drift and inline request payloads have explicit decisions.

Fallback: if generated-type exploration proves too noisy, keep the current split barrels plus fixture-backed audit check and return to product work.

Do not start with `storage.py`, `models.py`, backend routers, `RecallWorkspace.tsx`, or CSS splitting from this slice. Those remain valuable maintainability work, but they need stronger regression gates than the current contract audit provides.

## Next Codex Prompt

```text
We are continuing Accessible Reader API/types contract modernization.

Repo: /home/fa507/dev/accessible_reader

Start from the completed local branch/commit that added:
- docs/architecture/accessible-reader-api-types-contract-audit.md
- docs/exec_plans/active/accessible-reader-api-types-contract-audit.md
- scripts/contracts/audit_api_types_contract.py

Goal:
Explore generated TypeScript type feasibility without changing runtime behavior.

Constraints:
- Do not change backend schema, route behavior, UI, storage, generated Reader output, or Neuro Map Studio.
- Keep `frontend/src/api.ts` and `frontend/src/types.ts` as compatibility barrels.
- Do not introduce heavy dependencies.
- Keep the script/check developer-only and report/fixture based.

Tasks:
1. Inspect the current audit script output.
2. Compare OpenAPI schema names and frontend type names for generated-type readiness.
3. Document decisions needed for `DocumentMode`/`ViewMode`, `DetailLevel`/`SummaryDetail`, `StudyReviewRatingLabel`/`StudyReviewRating`, multipart body schemas, and inline request payloads.
4. Run backend pytest, frontend typecheck, focused api tests, full frontend tests, frontend build, the contract audit check, and git diff --check.
5. Update docs only as needed to describe the feasibility result.

Deliverables:
- A tiny check-only fixture/test/script update.
- Documentation update describing how to run and interpret it.
- Local commit if checks pass.
- No push.
```
