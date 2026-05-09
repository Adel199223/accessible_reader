# Stage 1032 Graph Path Study Questions After Stage 1031

## Summary
Open a fresh Stage 1032/1033 slice above Stage 1030/1031. Stage 1030 made found Graph paths reviewable when due/new relation-backed Study cards already exist, but covered/scheduled path cards still have no direct management handoff and uncovered path edges still require the user to leave the path context to create first practice. Recall's current public direction emphasizes saved knowledge, graph exploration, and review, so the highest-leverage compliant next move is to let a highlighted Graph path open Study Questions filtered to every Study card grounded to that path's relation edges and build the first missing relation-backed card through the existing local Study creation seam.

Sources checked: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog/recall-release-notes-april-14-2026-recall-20), [Graph View 2.0 notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), and [Recall studying docs](https://recall.cards/docs/studying).

## Key Changes
- Add a path-scoped Study Questions filter over multiple Graph relation edge ids, parallel to the existing single `relationEdgeId` filter.
- Add a compact `Path questions` action in the Graph focus rail whenever a found path has any relation-backed Study cards, including scheduled/practiced cards that are not Review-eligible.
- Add a compact `Build path practice` action when a found path has an uncovered non-rejected edge with a saved source, reusing the existing local relation-card payload and Study Questions handoff.
- Add a Study Questions path filter chip showing `Path: <label>`, count, and clear action.
- Make the path filter compose with existing source scope, collection, status, schedule, knowledge-stage, review-history, difficulty, and search filters.
- Keep `Review filtered` limited to the visible path-filtered queue.
- Add a `Study path questions` action from the path-practice recap so completed path Review sessions can move straight into managing the path's cards.
- Preserve Stage 1030 `Practice path`, Stage 1028 Graph connection return, Source/Home relation-practice behavior, Reader generated-output freeze, backend/public API shape, and Study FSRS ownership.

## Public APIs / Types
- No backend endpoint is required.
- No database migration is required.
- No generated API contract drift is expected.
- Frontend continuity gains optional Study fields for path relation edge ids and a path label.
- Existing local `POST /api/recall/study/cards` usage is reused for path gap creation; no new endpoint is added.

## Test Plan
- Frontend:
  - Graph Path Finder shows `Path questions` after a found path with scheduled/practiced path-backed cards.
  - `Path questions` opens Study Questions with only cards whose `source_spans[].edge_id` is in the path edge ids.
  - The active path filter chip shows the path label, count, and clear action.
  - `Build path practice` creates a first relation-backed Study card for an uncovered path edge and opens the path-filtered Study Questions view.
  - Search/status/schedule filters compose with the path filter.
  - `Review filtered` starts only due/new cards visible through the path filter.
  - Path-practice recap exposes a `Study path questions` action that opens the same path-filtered Questions view.
  - Existing Stage 1030 `Practice path` and Stage 1028 `Practice connection` behavior remain stable.
- Browser/Playwright:
  - Use Browser tooling first for page identity when available.
  - Add `scripts/playwright/stage1032_graph_path_study_questions_after_stage1031.mjs`.
  - Capture found Graph path with `Path questions`, path-filtered Study Questions, `Build path practice`, path recap `Study path questions`, Stage 1030 path Review preservation, Stage 1028 single-connection return preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Graph path questions/practice tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q`.
  - Full `App.test.tsx`, `api.test.ts`, and full Vitest once focused tests pass.
  - Stage 1030 and Stage 1028 Playwright reruns.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- Existing Study cards with `source_spans[].edge_id` remain the source of truth for path Study coverage.
- A path Questions view may be global when a path spans multiple source documents; source scope remains set when every visible path card belongs to one source.
- Missing path practice creation is limited to the first uncovered path edge and uses the existing user-visible relation-card payload; no automatic AI generation is introduced.
- No automatic AI generation, backend schema/API work, cloud sync, chat, TTS, extension capture, or Reader-output changes are included.
