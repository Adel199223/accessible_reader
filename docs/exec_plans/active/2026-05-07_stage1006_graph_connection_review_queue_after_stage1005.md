# Stage 1006 Graph Connection Review Queue After Stage 1005

## Summary
Open a fresh Stage 1006/1007 slice that turns Graph's existing suggested relations into a local review queue. Recall's public direction emphasizes saved knowledge becoming connected, reviewable, and personally useful; this repo can now build Graph nodes from highlight/source-note gaps, but suggested edges still require users to stumble into an individual node detail before deciding whether a connection belongs. The highest-leverage compliant move is a compact Graph-owned `Connection review` queue over existing suggested edges, reusing the current edge decision endpoint and Reader evidence handoffs without adding schema, chat, cloud, TTS, FSRS, extension capture, or generated Reader-output changes.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), [Recall site](https://www.recall.it/).

## Key Changes
- Add a compact Graph-surface `Connection review` queue derived from `KnowledgeGraphSnapshot.edges` where `status === 'suggested'`.
- Increase the frontend's default Graph snapshot edge/node request enough that relation review is not starved by the previous browse-only edge limit in larger local workspaces.
- Keep relation review state owned by existing Graph edge status; do not add a new queue table or persisted connection-review state.
- Each suggested-connection row should expose existing local actions only:
  - `Review connection` focuses the source/target path in Graph and opens the existing connection detail/evidence context.
  - `Open evidence` uses the existing Reader source/evidence handoff for the edge.
  - `Confirm` and `Reject` call the existing `POST /api/recall/graph/edges/{edge_id}/decision` flow and refresh the Graph snapshot.
- Surface pending relation counts using the existing Graph summary fields so users can see the queue even when the build-gap queue is empty.
- Keep the Stage 1004 Graph gap build queue and `Back to Graph gaps` return loop intact.
- Keep Study `covered` semantics, highlight review filters, Reader outputs, FSRS, and workspace export/restore behavior unchanged.

## Public APIs / Types
- No new backend endpoint is required.
- Existing `GET /api/recall/graph` supplies suggested edges and summary counts.
- Existing `POST /api/recall/graph/edges/{edge_id}/decision` confirms/rejects relations.
- No schema migration, generated Reader-output change, or generated API contract change is expected.

## Test Plan
- Frontend:
  - Graph shows a compact `Connection review` queue when suggested edges exist.
  - Queue rows expose `Review connection`, `Open evidence`, `Confirm`, and `Reject`.
  - `Review connection` focuses the existing connection detail for that relation.
  - `Open evidence` opens the existing Reader/evidence handoff for that relation.
  - Confirm/reject call the existing edge decision API and refresh the visible queue.
  - Existing selected-node connection decisions, Stage 1004 Graph gaps, focused Graph handoffs, and Source/Study/Reader flows remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs`.
  - Capture Graph connection-review queue, relation focus, evidence handoff, confirm/reject refresh, Stage 1004 Graph gap preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Graph connection tests.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, frontend typecheck, and build.
  - Backend `tests/test_api.py` if any API behavior drifts.
  - Stage 1004 Playwright rerun.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- Suggested edges are already local review items; Stage 1006 only makes them discoverable and actionable.
- Empty relation queues should stay quiet and compact because small workspaces may have no suggested relations.
- Edge quality remains user-reviewed; Stage 1006 must not auto-confirm inferred relations.
- If the Graph sidebar becomes crowded, the relation queue stays limited and compact rather than becoming another dashboard.
