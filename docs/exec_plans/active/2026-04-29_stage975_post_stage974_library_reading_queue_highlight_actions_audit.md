# Stage 975 - Post-Stage-974 Library Reading Queue Audit

## Status

Completed audit gate as of April 29, 2026, after Stage 974 implementation.

## Intent

Audit that the actionable reading queue and highlight-to-Study handoffs preserve the existing local-first Recall baselines.

## Scope

- Confirm Home reading queue summaries and state filters work for all sources, built-in scopes, and custom parent/leaf collections.
- Confirm queue-aware Continue reading opens Reader at the saved position or first unread source and preserves collection scope.
- Confirm Mark complete updates only reading progress in Home and Source overview.
- Confirm highlight rows open anchored Reader, Notebook note detail, and the existing Study promotion seam.
- Confirm Reader Next in queue advances inside the launch scope and generated Reader outputs remain frozen.
- Preserve Stage 972 resume/highlight context, Stage 970 collection actions, Stage 968 tree behavior, Stage 966/964 import collections, Stage 958-963 backup/export/restore, Reader-led quiz launch, Study sessions/habits/attempts, Home review signals, Source overview memory/review/export, Notebook, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `homeReadingQueueVisible`
- `homeReadingQueueStateFiltersWork`
- `homeReadingQueueContinueOpensReader`
- `homeReadingQueueMarkCompleteUpdatesProgress`
- `sourceOverviewMarkCompleteVisible`
- `highlightCreateStudyOpensPromotion`
- `readerNextInQueueVisible`
- `readerGeneratedOutputsFrozen`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Completed after Stage 974 backend/frontend tests passed.
- Captured live browser evidence for Home queue, Source overview mark-complete, Reader queue handoff, highlight-to-Study handoff, and broad regression surfaces.
- Ran backend/frontend broad checks, cleanup dry-run, and `git diff --check`.

## Audit Evidence

- `scripts/playwright/stage975_post_stage974_library_reading_queue_highlight_actions_audit.mjs --base-url=http://127.0.0.1:8026` passed and wrote `output/playwright/stage975-post-stage974-library-reading-queue-highlight-actions-audit-validation.json`.
- Focused Stage 974 evidence confirmed Home Reading queue summary/state filters/Continue reading/Mark complete, custom parent collection queue aggregation, Source overview reading context and highlight actions, Reader `Next in queue`, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Broad regression evidence retained Stage 972 resume/highlight inbox, Stage 970 collection workspaces, Stage 968 collection tree, Stage 966/964 imports, Stage 958-963 export/backup/restore, Reader-led quiz launch, Study sessions/habits/attempts, Home review signals, Source overview memory/review/export, Notebook, Graph, and Add Content.

## Validation Result

- Backend `backend/tests/test_api.py`: 91 passed.
- Frontend typecheck: passed.
- Focused `frontend/src/App.test.tsx`: 163 passed.
- Full frontend Vitest: 259 passed, 20 skipped.
- `npm run build`: passed with the existing Vite chunk-size warning.
- Cleanup dry-run: `matchedCount: 0`.
- In-app browser smoke at `http://127.0.0.1:8026/recall`: Home, Reading queue, and Export workspace rendered with no fatal error text.
- `git diff --check`: passed.
