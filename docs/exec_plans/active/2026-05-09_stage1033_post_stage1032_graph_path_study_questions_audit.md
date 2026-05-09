# Stage 1033 Post-Stage-1032 Graph Path Study Questions Audit

## Summary
Audit Stage 1032's Graph path-to-Study Questions loop. The audit must prove that a found Graph Path Finder result can open Study Questions filtered by all relation-backed cards along the path, can build first practice for an uncovered path edge through the existing relation-card seam, that the filter composes with existing Study Questions controls, and that Stage 1030 path Review plus Stage 1028 Graph connection return behavior remain stable.

## Audit Checklist
- Graph Path Finder can select two nodes and find a visible shortest path.
- A found path with relation-backed cards shows `Path questions`.
- `Path questions` opens Study Questions with a visible path filter chip and only path-backed cards.
- The path filter chip shows the path label, count, and clear action.
- A found path with an uncovered source-backed edge shows `Build path practice`.
- `Build path practice` creates a relation-backed Study card and opens the path-filtered Study Questions view.
- Search, status, and schedule filters compose with the path filter.
- `Review filtered` starts only visible due/new path-backed cards.
- A path-practice recap shows `Study path questions` and opens the same path-filtered Questions view.
- Stage 1030 `Practice path` still starts path-scoped Review and returns to the highlighted Graph path.
- Stage 1028 `Practice connection` still returns to the focused Graph connection.
- Source/Home relation-practice returns remain stable.
- Generated Reader outputs remain frozen.
- Cleanup dry-run reports `matchedCount: 0`.

## Validation Commands
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Graph path questions|Graph path practice|Graph relation practice|Relation practice review sessions"`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1032_graph_path_study_questions_after_stage1031.mjs --base-url http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1030_graph_path_relation_practice_handoffs_after_stage1029.mjs --base-url http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1028_graph_relation_practice_return_loop_after_stage1027.mjs --base-url http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- git diff --check`

## Evidence To Capture
- Graph path selected with `Path questions`.
- Graph path practice gap creation through `Build path practice`.
- Path-filtered Study Questions.
- Composed path plus search/status/schedule filters.
- Path-practice recap `Study path questions`.
- Returned highlighted Graph path from Stage 1030.
- Stage 1028 single-connection return preservation.
- Cleanup dry-run result.
