# Stage 1002 Home Graph-Gap Learning Queue Lens After Stage 1001

## Summary
Open a fresh Stage 1002/1003 slice that promotes Stage 1000's highlight-level Graph connection filters into Home/custom collection source discovery. Recall's public direction emphasizes saved knowledge becoming organized, connected, and retained; this repo now lets a user filter an opened highlight inbox by `Connected` or `Not in Graph`, but the Home Reading queue still cannot surface which sources have reviewable highlights not connected to Graph. The highest-leverage compliant next move is to add a `Graph gaps` Reading queue learning lens that routes users straight into the existing Source highlight review `Not in Graph` flow.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), [Recall site](https://www.recall.it/).

## Key Changes
- Extend `LibraryReadingQueueLearningFilter` with `graph_gaps`.
- Extend Reading queue highlight review counts with derived `graph_covered` and `ungraphed` counts.
- Extend Reading queue learning summary with `graph_gap_sources`.
- Derive queue-level Graph gaps from existing non-rejected `knowledge_nodes.metadata_json.promoted_note_ids`; do not store a separate state.
- Add a compact `Graph gaps` learning filter to Home/custom collection Reading queue.
- When `Graph gaps` is active, keep the Home highlight review inbox on `unconnected` and make row `Review highlights` open Source overview with Source highlight review set to `unconnected`.
- Add row-level `not in Graph` learning-gap text beside existing needs-review and Study-covered text.
- Keep existing highlight inbox `Connected` / `Not in Graph` filters, Graph row/session actions, Study coverage semantics, Reader outputs, FSRS ownership, and cleanup hygiene unchanged.

## Public APIs / Types
- Existing endpoint only: `GET /api/recall/library/reading-queue`.
- `LibraryReadingQueueLearningFilter` gains `graph_gaps`.
- `LibraryReadingQueueHighlightReviewCounts` gains `graph_covered` and `ungraphed`.
- `LibraryReadingQueueLearningSummary` gains `graph_gap_sources`.
- Generated OpenAPI/type snapshots update to match the existing endpoint shape.
- No schema migration and no new persisted fields.

## Test Plan
- Backend:
  - `learning_filter=graph_gaps` returns only sources with non-dismissed highlight/source notes without non-rejected Graph coverage.
  - The filter composes with custom collection and reading state before limit.
  - Dismissed notes do not count as Graph gaps.
  - Rejected Graph nodes do not count as connected coverage and still leave a Graph gap.
  - Existing Study learning filters and highlight inbox filters still pass.
- Frontend:
  - Home/custom collection Reading queue exposes `Graph gaps`.
  - Selecting `Graph gaps` requests `learningFilter: 'graph_gaps'`, switches Home highlight review to `unconnected`, and shows `not in Graph` row metadata.
  - Row `Review highlights` opens Source overview with Source highlight review set to `unconnected`.
  - Existing Study/review-state learning filters still route to their current highlight inbox states.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1002_home_graph_gap_learning_queue_lens_after_stage1001.mjs`.
  - Capture Home Graph-gap queue, custom collection Graph-gap queue, Source overview `Not in Graph` handoff, Notebook Graph promotion from the routed source row, focused Graph handoff after promotion, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Backend `backend/.venv/bin/python -m pytest tests/test_api.py -q`
  - Frontend typecheck
  - Focused `App.test.tsx` Graph-gap tests
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, build
  - API contract/OpenAPI snapshot checks
  - Stage 1000 audit rerun
  - Cleanup dry-run and `git diff --check`

## Assumptions
- "Graph gaps" means non-dismissed highlight/source notes that are not connected to a non-rejected Graph node.
- "Covered" continues to mean Study-covered, not Graph-connected.
- Graph gaps are queue lenses, not persisted missions or note state.
- No chat, API/MCP, cloud sync, notifications, shared challenges, extension capture, local TTS, AI note generation, generated Reader-output changes, or FSRS changes.
