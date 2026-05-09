# Stage 1004 Graph Gap Build Queue And Return Loop After Stage 1003

## Summary
Open a fresh Stage 1004/1005 slice that moves Stage 1002's Home Graph-gap discovery into Graph-owned action. Recall's public direction emphasizes saved knowledge becoming connected, reviewable, and personally useful; this repo now surfaces sources with unconnected highlight/source notes, but Graph itself does not yet help users build from those gaps or return to the same local review queue after a Notebook Graph promotion. The highest-leverage compliant next move is a compact Graph build queue plus a preserved return loop back to the originating `Graph gaps` / `Not in Graph` context.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), [Recall site](https://www.recall.it/).

## Key Changes
- Add a compact Graph-surface build queue for unconnected highlights/source notes, derived from the existing `GET /api/recall/library/highlight-review-inbox?state=unconnected` response.
- Keep Graph coverage derived from non-rejected `knowledge_nodes.metadata_json.promoted_note_ids`; do not add persisted Graph-gap state.
- From Graph's build queue, support existing handoffs only:
  - `Create Graph node` opens the Notebook Graph promotion seam for the note.
  - `Open source review` opens Source overview highlight review filtered to `Not in Graph`.
- Preserve the existing successful Notebook Graph promotion behavior: the promoted node opens in focused Graph.
- After promotion from a highlight review / Graph-gap context, show a compact `Back to Graph gaps` return action in Graph that restores the originating source, Home, or custom collection filters.
- Preserve `graph_gaps` in the existing highlight-review return-filter helper so return loops do not silently degrade to `all`.
- Keep Study `covered` semantics unchanged and keep Reader outputs, FSRS, chat/API/cloud/TTS/extension capture out of scope.

## Public APIs / Types
- No new backend endpoint is required.
- Existing `GET /api/recall/library/highlight-review-inbox` is reused with `state=unconnected`.
- Existing `POST /api/recall/notes/{note_id}/promote/graph-node` behavior remains the same and continues to mark promoted notes reviewed.
- Add frontend-only return-origin state for restoring the current Graph-gap review context.
- No schema migration and no generated Reader-output changes.

## Test Plan
- Frontend:
  - Graph surface loads an unconnected highlight/source-note build queue.
  - Queue rows expose `Create Graph node` and `Open source review`.
  - Creating a Graph node through the Notebook promotion seam lands in focused Graph and exposes `Back to Graph gaps`.
  - `Back to Graph gaps` restores Source highlight review with `Not in Graph` when launched from source review.
  - Home/custom collection Graph-gap return filters preserve `learningFilter: 'graph_gaps'`.
  - Existing Home Graph gaps, Source Graph filters, Study covered-highlight review, Reader/Notebook handoffs, and focused Graph handoff tests remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs`.
  - Capture Graph build queue, Notebook Graph promotion from that queue, focused Graph handoff, return to Source `Not in Graph`, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Frontend focused `App.test.tsx` Graph gap tests.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, typecheck, and build.
  - Backend `tests/test_api.py` if any API behavior drifts.
  - Stage 1002 and Stage 1000 Playwright reruns.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- "Graph gaps" means non-dismissed highlight/source notes without non-rejected Graph coverage.
- The Graph build queue is a derived local work queue, not a new persisted mission/state.
- Graph creation continues through the existing user-visible Notebook promotion draft.
- If Graph settings/sidebar space becomes crowded, the queue stays compact and limited rather than adding another large dashboard.
