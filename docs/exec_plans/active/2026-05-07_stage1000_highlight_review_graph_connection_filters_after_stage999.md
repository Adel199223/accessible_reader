# Stage 1000 Highlight Review Graph Connection Filters After Stage 999

## Summary
Open a fresh Stage 1000/1001 slice that turns Stage 998 Graph coverage from a row status into a queue-level local review loop. Recall's public direction emphasizes saved knowledge, notes, review, and graph-style resurfacing; this repo now derives Graph coverage for highlight/source-note rows, but users still cannot focus the inbox on connected or unconnected highlights. The highest-leverage compliant next move is to add Graph connection filters to the existing highlight review inbox/session while keeping Study "covered" semantics unchanged.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/).

## Key Changes
- Extend `HighlightReviewInboxState` with `connected` and `unconnected`.
- Keep Graph coverage derived from non-rejected `knowledge_nodes.metadata_json.promoted_note_ids`; do not store a separate Graph state.
- Filter `GET /api/recall/library/highlight-review-inbox` by connected/unconnected state under built-in scope, custom collection scope, and source scope.
- Add compact Graph connection controls to Home/custom collection and Source highlight review panels without crowding the existing Study/review-state filter row.
- Let the existing guided review session start from connected or unconnected rows, preserving row/session Graph actions:
  - unconnected rows use `Create Graph node` through the existing Notebook graph promotion seam.
  - connected rows use `Open Graph node` with focused Graph handoff.
- Update generated/API contract snapshots and frontend/backend types.
- Create a Stage 1001 audit plan after implementation.

## Public APIs / Types
- Existing endpoint only: `GET /api/recall/library/highlight-review-inbox`.
- `HighlightReviewInboxState` gains `connected | unconnected`.
- `HighlightReviewInboxSummary` keeps existing Graph count fields: `graph_covered_items` and `ungraphed_items`.
- No schema migration and no new persisted fields.

## Test Plan
- Backend:
  - connected/unconnected filters derive from promoted note ids.
  - rejected Graph nodes are excluded from connected filter and included in unconnected.
  - filters compose with built-in scope, custom collection, source scope, reading state, and learning filter where applicable.
  - existing Study coverage, review-state filters, and Graph promotion tests still pass.
- Frontend:
  - Home/custom collection panel exposes compact Graph connection filter controls and updates row state.
  - Source panel exposes the same controls.
  - Connected rows show `Open Graph node`; unconnected rows show `Create Graph node`.
  - Guided session can start from unconnected rows and keeps the Stage 998 Graph action.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1000_highlight_review_graph_connection_filters_after_stage999.mjs`.
  - Capture Home/custom collection connected/unconnected filters, Source connected/unconnected filters, unconnected guided session Graph creation handoff, connected focused Graph handoff, Stage 998 preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Backend `backend/.venv/bin/python -m pytest tests/test_api.py -q`
  - Frontend typecheck
  - Focused `App.test.tsx` Graph/highlight tests
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, build
  - API contract/OpenAPI snapshot checks
  - Stage 998 audit rerun
  - Cleanup dry-run and `git diff --check`

## Assumptions
- "Covered" continues to mean Study-covered; "connected" means Graph-covered.
- Graph filters are local queue lenses, not new note state.
- No chat, API/MCP, cloud sync, notifications, shared challenges, extension capture, local TTS, AI note generation, generated Reader-output changes, or FSRS changes.
- Dismissed notes remain recoverable and are excluded from unconnected work counts just as Stage 998 excluded them from ungraphed items.
