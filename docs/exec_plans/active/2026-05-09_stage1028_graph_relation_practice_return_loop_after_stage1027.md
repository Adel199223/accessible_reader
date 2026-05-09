# Stage 1028 Graph Relation Practice Return Loop After Stage 1027

## Summary
Open a fresh Stage 1028/1029 slice that closes the Graph-launched relation-practice loop. Stage 1026 lets Graph detail `Connections` rows start relation-scoped Study Review, but the Study recap still treats every relation-practice session as Source-launched and returns through `Back to source connection`. Recall's current public direction emphasizes graph exploration, saved knowledge resurfacing, and review workflows, so the highest-leverage local-first refinement is to preserve Graph origin through the existing session `filter_snapshot` and return Graph-launched practice to the focused Graph connection row.

Sources checked: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog/recall-release-notes-april-14-2026-recall-20), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Graph View 2.0 notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more), and [Recall card review docs](https://recall.cards/docs/studying).

## Key Changes
- Extend `handleStartRelationPracticeReviewSession` with a frontend-local return origin option.
- For Graph-launched `Practice connection`, write `return_surface: "graph"` plus selected/endpoint node ids into the existing session `filter_snapshot`.
- Keep Source/Home relation-practice launches on the existing Source return behavior.
- Extend relation-practice recap origin parsing to understand the optional return surface.
- Change recap copy/action only for Graph-origin sessions:
  - show `Back to Graph connection`
  - restore the Graph section, focused connection path/selection, `Connections` detail tab, and focused relation row
- Preserve Stage 1026 Graph row practice actions, Stage 1024 Home/Source progress signals, generated Reader-output freeze, cleanup hygiene, backend/public API shape, and Study FSRS ownership.

## Public APIs / Types
- No new endpoint is required.
- No database migration is required.
- No generated API contract drift is expected.
- The new return-origin fields remain in the already-flexible Study session `filter_snapshot`.

## Test Plan
- Frontend:
  - Graph relation `Practice connection` starts a relation-scoped Review session with `return_surface: "graph"` in the snapshot.
  - Graph-launched relation-practice recap shows `Back to Graph connection` and returns to the Graph `Connections` row for the practiced edge.
  - Source-launched relation-practice recap still shows `Back to source connection` and returns to the focused Source overview relation row.
  - Existing Graph practiced/scheduled fallback and no-practice create handoffs remain stable.
- Browser/Playwright:
  - Use in-app Browser tooling first for page identity.
  - Add `scripts/playwright/stage1028_graph_relation_practice_return_loop_after_stage1027.mjs`.
  - Capture Graph relation Review launch, Graph recap return to focused connection, Source return preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Graph/relation-practice tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q`.
  - Full `App.test.tsx`, `api.test.ts`, and full Vitest if focused changes are stable.
  - Cleanup dry-run and `git diff --check`.

## Implementation Notes
- Added Graph-origin metadata to relation-practice Study session snapshots only when launch starts from Graph detail `Connections`.
- Preserved Home and Source relation-practice launches as Source-return sessions.
- Added Graph recap routing so `Back to Graph connection` restores Graph, focuses the practiced relation path, opens the selected node `Connections` list, and marks the practiced row with `data-graph-detail-relation-focused-stage1028="true"`.
- Added `scripts/playwright/stage1028_graph_relation_practice_return_loop_after_stage1027.mjs` for deterministic browser evidence across Graph launch, Graph recap return, Source return preservation, generated-output freeze, and cleanup hygiene.

## Validation Results
- Browser identity: in-app Browser tooling confirmed the live Recall Workspace at `http://127.0.0.1:8001/recall?section=graph`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1028_graph_relation_practice_return_loop_after_stage1027.mjs --base-url http://127.0.0.1:8001` - passed with Graph-origin snapshot, Graph recap copy, focused Graph return, Source return preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Graph relation practice|Relation practice review sessions"` - 4 passed, 201 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false` - passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot` - 205 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot` - 302 passed, 20 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build` - passed with the existing Vite chunk-size warning.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.

## Assumptions
- Session `filter_snapshot` is the correct local-only place to preserve return origin.
- Graph return should not create new persisted route state; the existing Graph continuity state and connection-review focus helpers are enough.
- Source/Home relation-practice flows should keep their current Source-focused return because Source overview remains the detailed related-source workspace.
- The broader Graph path-to-Study handoff remains a good future slice, but this return-loop fix is smaller and directly completes the Stage 1026 user journey.
