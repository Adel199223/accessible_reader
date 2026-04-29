# Stage 964 - Add Content Bulk Import Queue After Stage 963

## Status

Completed on April 28, 2026.

## Intent

Make Add Content handle local bulk intake from exported reading archives while keeping import local-first, previewable, and additive through the existing one-time snapshot pipeline.

## Scope

- Add a dry-run `POST /api/documents/import-batch-preview` endpoint for local bookmark HTML, Pocket-style exports, and URL lists.
- Add guarded `POST /api/documents/import-batch` apply behavior that imports only selected ready preview rows and reports imported, reused, skipped, and failed rows.
- Keep existing text, file, and single URL import routes backward compatible.
- Add a compact Add Content `Bulk import` mode with file upload, format/max controls, preview rows, selected import, and result summary.
- Keep archive folder/tag metadata preview/result-only in this slice; do not introduce new persisted collection/tag semantics.
- Preserve Home route stability, Reader generated-output freeze, Source overview, Study sessions, export/restore, Notebook, Graph, and cleanup hygiene.

## Validation Plan

- Backend coverage for bookmark HTML, Pocket CSV/HTML, URL-list parsing, invalid rows, duplicate detection, `max_items` bounds, dry-run no-mutation, selected apply, partial failure reporting, and unchanged single import routes.
- Frontend coverage for Add Content bulk controls, preview upload body, selectable ready rows, import-selected body, result summary, Home refresh, and absence of cloud/restore/apply concepts in Add Content.
- Stage 964 Playwright evidence for previewing a local archive, importing selected URLs, seeing imported sources in Home/Reader, and cleanup dry-run `matchedCount: 0`.
- Broad backend/frontend validation, Stage 965 audit evidence, build/typecheck, and `git diff --check`.

## Implementation Notes

- Added local batch preview/apply endpoints for bookmark HTML, Pocket-style CSV, and URL-list archives.
- Added deterministic row ids, ready/duplicate/invalid/unsupported row statuses, upload-local de-dupe, existing-web-source de-dupe, and bounded `max_items`.
- Routed selected ready rows through the existing single webpage snapshot/parser/storage path and reported per-row imported, reused, skipped, or failed outcomes without aborting the whole batch.
- Added the compact Add Content `Bulk import` tab with file/format/max controls, dry-run preview rows, selected import, and result summary.
- Added Home/Recall reload continuity after successful batch imports while preserving text/file/URL import behavior and route stability.

## Validation Evidence

- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest tests/test_api.py -q"` - 85 passed
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false"` - passed
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/api.test.ts src/App.test.tsx --reporter=dot"` - 161 passed
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"` - passed with the existing Vite chunk-size warning
- `node scripts/playwright/stage964_add_content_bulk_import_queue_after_stage963.mjs --base-url=http://127.0.0.1:8011` - passed on a fresh temporary backend with `addContentBulkImportModeVisible: true`, `addContentBulkPreviewDryRun: true`, `addContentBulkPreviewRowsVisible: true`, `addContentBulkSelectedImportWorks: true`, `addContentBulkImportResultVisible: true`, `addContentSingleImportsStable: true`, and cleanup dry-run `matchedCount: 0`
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"` - passed
