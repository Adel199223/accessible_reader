# ExecPlan: Stage 7 Tablet-Safe Groundwork

## Summary
- Add the first merge-safe workspace portability surface without introducing live sync, background replication, or cloud state.
- Expose the existing shared change log through a stable incremental API so future tablet/device work can replay local history deterministically.
- Add portable workspace export primitives: attachment references, a manifest of portable entity digests, and a deterministic merge-preview API.
- Keep Reader, Recall, graph, study, Markdown export, and the MV3 extension behavior unchanged in this slice.

## Public Interfaces
- Add backend-only workspace portability routes:
  - `GET /api/workspace/change-events`
  - `GET /api/workspace/attachments`
  - `GET /api/workspace/attachments/{attachment_id}`
  - `GET /api/workspace/export.manifest.json`
  - `GET /api/workspace/export.zip`
  - `POST /api/workspace/merge-preview`
- Add portable response/request contracts:
  - `WorkspaceChangeLogPage`
  - `PortableEntityDigest`
  - `WorkspaceExportManifest`
  - `WorkspaceMergePreviewRequest`
  - `WorkspaceMergeOperation`
  - `WorkspaceMergePreview`
- Keep current reader and Recall routes stable.

## Implementation Changes
- Change-log feed:
  - Page the existing `change_events` table in ascending `(created_at, id)` order.
  - Support `after` cursor and optional `entity_type` filtering without changing existing event writers.
  - Return `next_cursor`, `has_more`, and `latest_cursor` so future clients can checkpoint replay.

- Portable attachments:
  - Derive attachment refs from `source_documents.stored_path` instead of introducing a second file store.
  - Use stable relative paths under the workspace data directory and expose byte size plus a binary digest for portability checks.
  - Export attachments individually and inside a workspace zip bundle without changing current import/delete behavior.

- Workspace export manifest:
  - Build a deterministic manifest over portable shared entities only:
    - `source_documents`
    - `document_variants`
    - `reading_sessions`
    - `app_settings`
    - `knowledge_nodes`
    - `knowledge_edges`
    - `review_cards`
    - `review_events`
  - Exclude rebuildable derived tables (`content_chunks`, `entity_mentions`, `embeddings`, FTS tables) from the portable manifest.
  - Use logical keys instead of raw row ids where cross-device duplicates are plausible, such as source documents by `content_hash` and reading sessions by logical session identity.

- Deterministic merge preview:
  - Compare a remote manifest against the current local manifest without mutating storage.
  - Decision rules:
    - missing local record => `import_remote`
    - matching digest => `skip_equal`
    - newer `updated_at`/event timestamp wins
    - equal timestamp but different digest => break ties lexicographically by digest so the outcome is deterministic
  - Return operation summaries only; actual state import/replay is deferred.

- Documentation/continuity:
  - Move this plan to completed only after backend/frontend validation is green and the manual portability smoke pass succeeds.
  - Advance roadmap state to Stage 8 only after Stage 7 validation is complete.

## Test Plan
- Backend:
  - change-log feed paginates and resumes from `after` cursor
  - attachment listing and download expose the stored source file with stable metadata
  - workspace manifest includes portable entity digests and attachment refs
  - workspace zip contains `manifest.json` plus attachment payloads
  - merge preview returns deterministic `import_remote`, `skip_equal`, `prefer_remote`, and `keep_local` decisions
  - current reader, Recall, graph, study, and delete behavior remain unchanged
- Validation:
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - one manual localhost API smoke pass for manifest export, zip export, and merge preview

## Assumptions
- Stage 6 portability work is stable and provides the richer shared document/session metadata that Stage 7 can now export.
- The current stored source files remain the attachment source of truth for this slice.
- Full sync, background merges, conflict UI, and remote transport remain deferred until after this groundwork is validated.
