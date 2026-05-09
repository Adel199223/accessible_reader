# Stage 1030 Graph Path Relation Practice Handoffs After Stage 1029

## Summary
Open a fresh Stage 1030/1031 slice that turns Graph Path Finder results into a local Study handoff. Stage 1028 completed the Graph-launched single-connection practice return loop, but the Graph path rail still ends at visual discovery: two selected nodes can reveal the shortest visible path, yet the highlighted relation edges do not offer a next recall action. Recall's current public direction emphasizes saved knowledge, graph exploration, and review workflows, so the highest-leverage compliant move is to let a found Graph path start a path-scoped Study Review session from existing relation-backed Study cards and return to the same highlighted Graph path afterward.

Sources checked: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog/recall-release-notes-april-14-2026-recall-20), [Graph View 2.0 notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), and [Recall studying docs](https://recall.cards/docs/studying).

## Key Changes
- Derive path practice coverage in the frontend from the active Graph Path Finder result's edge ids and existing `studyCards[].source_spans[].edge_id`.
- Add a compact path-practice status in the Graph focus rail after a shortest path is found:
  - due/new path-backed questions can start `Practice path`
  - scheduled/practiced path-backed questions show as already covered
  - paths without relation-backed Study cards show a quiet no-practice state
- Add `Practice path` to launch a Study Review session containing only eligible cards linked to the highlighted path edges.
- Store path return metadata in the existing Study session `filter_snapshot`: `launch_intent: "graph-path-practice-review"`, `return_surface: "graph_path"`, `path_edge_ids`, `path_node_ids`, and a readable path label.
- Add a path-practice recap that shows `Path practiced` and returns through `Back to Graph path`.
- Restore the Graph section, selected path endpoints, requested path result, highlighted path edges, and focus rail when returning from the recap.
- Preserve Stage 1028 single-connection Graph return behavior, Source/Home relation-practice returns, generated Reader-output freeze, cleanup hygiene, backend/public API shape, and Study FSRS ownership.

## Public APIs / Types
- No new endpoint is required.
- No database migration is required.
- No generated API contract drift is expected.
- The path return fields remain in the already-flexible Study session `filter_snapshot`.

## Test Plan
- Frontend:
  - Graph Path Finder shows path practice status after a visible shortest path is found.
  - `Practice path` starts a Study Review session scoped to relation-backed cards from the path edge ids.
  - The session snapshot carries `launch_intent: "graph-path-practice-review"`, `return_surface: "graph_path"`, `path_edge_ids`, `path_node_ids`, and path label.
  - Path-practice recap shows `Back to Graph path` and returns to the same highlighted path.
  - Paths without relation-backed Study cards do not show a false-ready practice action.
  - Existing Graph `Practice connection`, Source/Home relation-practice, and Study Review behavior remain stable.
- Browser/Playwright:
  - Use in-app Browser tooling first for page identity.
  - Add `scripts/playwright/stage1030_graph_path_relation_practice_handoffs_after_stage1029.mjs`.
  - Capture Graph path selection, found path practice action, active path-scoped Study session, path recap, Graph path return, Stage 1028 single-connection return preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Graph path/relation-practice tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q`.
  - Full `App.test.tsx`, `api.test.ts`, and full Vitest once focused tests pass.
  - Stage 1028 Playwright rerun if the Graph relation return area is touched.
  - Cleanup dry-run and `git diff --check`.

## Implementation Notes
- Added path practice derivation in `frontend/src/components/RecallWorkspace.tsx` from the active visible Graph path edge ids plus existing Study card `source_spans[].edge_id` values.
- Added a compact Graph focus-rail path status and `Practice path` handoff for eligible due/new relation-backed Study cards.
- Added path-scoped Study Review launch metadata in the existing flexible session snapshot: `launch_intent`, `return_surface`, `path_edge_ids`, `path_node_ids`, and `path_label`.
- Added `Path practiced` recap handling with `Back to Graph path`, restoring Graph, path endpoints, the active path result, and the focused path rail.
- Added `scripts/playwright/stage1030_graph_path_relation_practice_handoffs_after_stage1029.mjs` for seeded browser evidence.
- Preserved backend/API shape, database schema, Reader generated outputs, and FSRS ownership.

## Validation Results
- Focused red/green path tests: `npm test -- --run src/App.test.tsx --reporter=dot -t "Graph path practice"` - 3 passed.
- Focused relation regression set: `npm test -- --run src/App.test.tsx --reporter=dot -t "Graph path practice|Graph relation practice|Relation practice review sessions"` - 7 passed.
- Backend: `backend/.venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- Frontend typecheck: `npm exec tsc -- -b --pretty false` - passed.
- Frontend build: `npm run build` - passed with the existing Vite chunk-size warning.
- Full `App.test.tsx`: 208 passed.
- API tests: 12 passed.
- Full Vitest: 305 passed, 20 skipped.
- Stage 1030 Playwright: passed with path status/action, path-scoped Study session snapshot, `Path practiced` recap, `Back to Graph path`, returned highlighted path, no false-ready scheduled state, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Stage 1028 Playwright rerun: passed with Graph single-connection return, Source return preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.

## Assumptions
- Existing Study cards with `source_spans[].edge_id` are the source of truth for relation/path practice coverage.
- Graph path practice should start only review-eligible `new` / `due` cards; scheduled or unscheduled cards remain visible as coverage but do not enter the Review queue.
- A path-scoped session may span multiple source documents because the return target is the Graph path, not a single Source overview.
- No automatic AI question generation or graph labeling is added; practice uses cards that already exist.
- Broader multi-edge Study Questions browsing can be deferred unless this slice proves the UI needs it.
