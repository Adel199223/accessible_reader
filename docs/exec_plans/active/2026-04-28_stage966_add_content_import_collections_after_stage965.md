# Stage 966 - Add Content Import Collections After Stage 965

## Status

Completed on April 28, 2026.

## Intent

Make bulk imports land organized by persisting local Home collections from bookmark folders and Pocket/tag metadata while keeping import local-first, additive, and compatible with Stage 964 preview/apply behavior.

## Scope

- Add persisted Library settings in `app_settings` under the `library` namespace, including Home custom collections and document membership.
- Extend bulk import preview/apply with `pocket_zip`, optional collection creation, deterministic collection suggestions, collection result counts, and source import metadata.
- Keep collection creation opt-in at the API level and default-on in the Add Content UI.
- Preserve existing Home manual collection workflows while making create, rename, delete, and assignment persistent.
- Keep Home, Study collection subsets, Graph tag filtering, learning-pack provenance, workspace export/restore, Add Content text/file/URL imports, Reader generated outputs, and cleanup hygiene stable.

## Validation Plan

- Backend tests for Library settings defaults/persistence/validation, batch collection suggestions/results, Pocket ZIP parsing, metadata persistence, no-mutation preview, and Stage 964 compatibility.
- Frontend tests for Bulk import collection controls, collection suggestion/result UI, API form bodies, Home refresh, and persisted manual collection workflows.
- Stage 966 Playwright evidence for collection-aware bookmark/Pocket ZIP import, Home collection surfacing, Study/Graph collection/tag visibility, and cleanup dry-run `matchedCount: 0`.
- Broad backend/frontend validation, Stage 967 audit evidence, build/typecheck, and `git diff --check`.

## Closeout Evidence

- Backend `tests/test_api.py` passed with 88 tests after adding Library settings, Pocket ZIP preview, import collection creation, source metadata, and learning-pack provenance coverage.
- Frontend typecheck, focused import/API tests, full `frontend/src/App.test.tsx` with 153 tests, and `npm run build` passed.
- `node scripts/playwright/stage966_add_content_import_collections_after_stage965.mjs --base-url=http://127.0.0.1:8019` passed with collection suggestions, Pocket ZIP suggestions, Home persistence, Study subset visibility, Graph tag filtering, imported harness cleanup, and cleanup dry-run `matchedCount: 0`.
- `git diff --check` passed.
