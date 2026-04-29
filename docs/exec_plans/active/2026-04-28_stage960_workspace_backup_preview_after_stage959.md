# Stage 960 - Workspace Backup Preview After Stage 959

## Status

Completed.

## Intent

Make Stage 958 workspace backups verifiable before any restore/apply work by adding a local dry-run preview for exported workspace ZIP bundles and raw `manifest.json` files.

## Scope

- Add `POST /api/workspace/import-preview` as a dry-run-only multipart upload endpoint for current workspace export ZIP or raw manifest JSON files.
- Return existing merge-preview decisions plus a compact backup summary with export metadata, entity counts, attachment coverage, learning-pack coverage, warnings, `dry_run: true`, and `applied: false`.
- Keep `GET /api/workspace/export.manifest.json`, `GET /api/workspace/export.zip`, and JSON `POST /api/workspace/merge-preview` backward compatible.
- Validate malformed ZIP/JSON and missing manifests with clear 400 responses, enumerate only safe in-bundle paths, and never mutate local storage during preview.
- Extend the Home-owned workspace export utility into a compact backup preview surface while preserving the ZIP download action and avoiding restore/apply controls.
- Preserve Source overview exports, Reader-led quiz launch, Study sessions/attempts/habits, Reader generated-output freeze, Notebook, Graph, Add Content, FSRS semantics, and cleanup hygiene.

## Validation Plan

- Backend coverage for ZIP preview, manifest preview, invalid inputs, attachment/learning-pack coverage, attempt/session counts, and no storage mutation.
- Frontend coverage for Home backup preview upload, preview counts/warnings/coverage, retained ZIP action, and no restore/apply UI.
- Focused and broad frontend/backend validation, Stage 960 Playwright evidence, cleanup dry-run, and `git diff --check`.

## Completion Evidence

- Added dry-run-only `POST /api/workspace/import-preview` for exported workspace ZIP bundles and raw manifest JSON files, returning existing merge-preview decisions plus backup metadata, entity counts, attachment coverage, learning-pack coverage, warnings, `dry_run: true`, and `applied: false`.
- Preserved the existing manifest, ZIP export, and JSON merge-preview routes while rejecting invalid ZIPs, missing manifests, and malformed manifests with 400 responses.
- Added the Home backup preview upload surface beside the existing ZIP download action, showing dry-run status, entity counts, attachment and learning-pack coverage, warnings, and no restore/apply controls.
- Captured Stage 960 Playwright evidence in `output/playwright/stage960-workspace-backup-preview-validation.json` with ZIP and manifest previews, invalid-ZIP rejection, coverage metrics, attempt/session entity counts, Home preview visibility, and cleanup dry-run `matchedCount: 0`.
