# Stage 1014 Related Source Practice Readiness After Stage 1013

## Summary
Open a fresh Stage 1014/1015 slice that connects Stage 1012 related-source discovery to local Study practice. Recall's current public direction emphasizes saved knowledge, connected ideas, notes, review, and resurfacing what should be remembered next. Stage 1012 made related sources discoverable from Home and custom collections, but the loop still stops at "this source is related." The highest-leverage compliant move is to show whether a related Graph relation already has Study coverage and let the user practice that relation through the existing Study Questions surface.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), and [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content).

## Key Changes
- Derive relation practice coverage from existing non-deleted `StudyCardRecord.source_spans[].edge_id`; do not store a separate relation practice state.
- Extend Source overview related Graph connection rows with compact practice readiness: covered question count, due/new count when present, and a clear "No practice yet" state.
- Add `Practice relation` for related rows with Study coverage. It opens existing Study Questions scoped to the current source and filtered to cards whose source span `edge_id` matches the Graph edge.
- Add a clear active Study relation filter chip with the relation label and matching question count.
- Preserve existing Study filters, schedule drilldowns, review-history filters, difficulty filters, active review queues, and source-scoped Study behavior.
- Preserve existing handoffs: Home `Related sources` still opens Source overview, related row primary still opens the related source, relation review still opens Graph relation review, Study generation and FSRS remain owned by existing Study flows, and Reader outputs stay frozen.

## Public APIs / Types
- No backend endpoint is required.
- Existing Study cards already carry arbitrary `source_spans` records; generated graph-backed cards use `edge_id`.
- Frontend continuity state gains a local `relationEdgeId` Study filter. It is not a new backend API, schema, or generated contract field.
- Workspace export/restore remains backed by existing Study card payloads; older cards without `edge_id` simply do not count as relation-practice coverage.

## Test Plan
- Frontend:
  - Source overview related Graph rows show Study practice coverage derived from Study card `source_spans[].edge_id`.
  - `Practice relation` opens Study Questions with the current source selected and only matching relation-backed cards visible.
  - Active Study relation filter chip is clearable and restores the broader source-scoped question list.
  - Related rows without matching Study cards show "No practice yet" and do not expose a misleading practice handoff.
  - Stage 1012 Home/custom collection `Related sources` handoff and Stage 1010 relation review/open-source actions remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1014_related_source_practice_readiness_after_stage1013.mjs`.
  - Capture Home related-source handoff, Source overview relation-practice readiness, Study relation filter handoff/clear, Stage 1012 related-source preservation, Stage 1008 Graph relation review preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` relation-practice tests.
  - Focused Stage 1012 related-source and Stage 1008/1010 Graph connection tests.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, frontend typecheck, and build.
  - Backend `tests/test_api.py` if any API behavior drifts.
  - Stage 1014, Stage 1012, and Stage 1008 Playwright reruns.
  - Cleanup dry-run and `git diff --check`.

## Implementation Results
- Complete on 2026-05-08.
- Source overview related Graph connection rows now derive practice readiness from existing `StudyCardRecord.source_spans[].edge_id`, show matching question plus due/new counts when present, and show a recoverable "No practice yet" state when absent.
- `Practice relation` opens existing source-scoped Study Questions with a local `relationEdgeId` continuity filter; the active filter chip displays the relation label and matching question count and can be cleared back to the broader source question list.
- Existing Home/custom collection `Related sources`, Source overview related-source navigation, focused Graph relation handoff, Study generation, generated Reader outputs, and Study FSRS ownership remain unchanged.

## Assumptions
- "Practice-ready" means at least one local Study card has a source span with the related Graph edge id.
- The relation filter is local UI continuity, not a persisted recommendation model.
- Cards without an `edge_id` remain visible through normal source-scoped Study flows but do not count as relation practice coverage.
- No chat, cloud sync, notifications, TTS, extension capture, Reader-output generation, or FSRS changes are introduced.
