# ExecPlan: Stage 8 Hardening and Benchmarks

## Summary
- Harden the shared workspace after the Stage 1 through Stage 7 feature slices without opening a new product area.
- Focus on derived-data integrity, migration-safe recovery flows, export failure reporting, bounded extension/backend failures, and deterministic benchmark coverage.
- Keep Reader, Recall, graph, study, browser companion, and portability routes stable while hardening lands.

## Public Interfaces
- Add backend-only workspace integrity routes:
  - `GET /api/workspace/integrity`
  - `POST /api/workspace/repair`
- Add shared recovery contracts:
  - `WorkspaceIntegrityIssue`
  - `WorkspaceIntegrityReport`
  - `WorkspaceRepairResult`
- Extend `WorkspaceExportManifest` with non-fatal warning reporting for missing attachment payloads.
- Keep current Reader, Recall, study, graph, export, and extension-facing retrieval routes stable.

## Implementation Changes
- Workspace integrity and recovery:
  - Add explicit integrity scans for:
    - `source_documents_fts`
    - `content_chunks_fts`
    - missing attachment payload files
    - SQLite `PRAGMA quick_check`
  - Repair drifted derived tables by rebuilding from shared source-of-truth tables instead of assuming the FTS tables stayed aligned.
  - Record the last integrity and repair timestamps in workspace metadata so recovery behavior is inspectable.
  - Run bounded self-healing during backend startup after schema init and legacy migration so interrupted or manually edited workspaces recover automatically.

- Derived-data hardening:
  - Rebuild `source_documents_fts` deterministically from source documents plus canonical searchable text.
  - Rebuild `content_chunks_fts` deterministically from `content_chunks`, even when chunk rows themselves did not change.
  - Keep chunk, graph, card, and lexical-embedding rebuilds idempotent and compatible with legacy migration and delete flows.
  - Preserve current search, retrieval, and browser-context behavior after rebuilds.

- Export and merge recovery:
  - Keep export manifest and zip generation working when stored attachment files are missing.
  - Surface missing attachment paths as warnings in the exported manifest instead of silently dropping that information.
  - Keep merge preview deterministic against warning-carrying manifests.

- Benchmark coverage:
  - Add a deterministic benchmark harness runnable from the backend package.
  - Measure at least:
    - text ingest
    - file ingest
    - webpage snapshot ingest
    - Recall keyword search
    - Recall hybrid retrieval
    - browser-context lookup
    - workspace manifest export
    - workspace zip export
    - workspace merge preview
    - study-card generation
    - study-card review scheduling
  - Emit structured JSON with timings and workspace counts so future hardening work can compare runs without scraping console output.

- Extension hardening:
  - Bound extension backend requests with a timeout so the MV3 worker fails closed instead of hanging on unreachable localhost calls.
  - Keep current popup/content-script behavior and prompt rules unchanged apart from clearer timeout failure handling.

- Documentation/continuity:
  - Move this plan to completed only after backend, frontend, extension, and benchmark validation are green.
  - Advance roadmap state only after a real benchmark run and a repair/integrity smoke pass succeed.

## Test Plan
- Backend:
  - integrity report detects drifted FTS state and missing attachments
  - repair route rebuilds derived indexes and clears repairable integrity issues
  - startup repair recovers a drifted workspace created before app startup
  - export manifest carries warnings for missing attachment payloads while zip export still succeeds
  - merge preview accepts warning-carrying manifests unchanged
  - benchmark harness returns all required sections with positive timings
- Extension:
  - prompt behavior remains unchanged
  - timed-out backend requests return a stable error message
- Validation:
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - backend benchmark harness run saved to `output/`
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - extension `npm test -- --run`
  - extension `npm run build`
  - one localhost integrity/repair smoke pass

## Assumptions
- The current shared tables remain the durable source of truth; FTS rows, chunks, graph state, cards, and embeddings stay rebuildable derivatives.
- Missing stored attachment files are recoverable as warnings for export portability, not grounds to fail the whole export.
- The MV3 extension remains localhost-only and does not gain new capture/import capabilities in this slice.
