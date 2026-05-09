# Stage 1018 Source Relation Practice Gap Build After Stage 1017

## Summary
Open a fresh Stage 1018/1019 slice that closes the remaining local learning loop around related Graph connections. Recall's current public direction emphasizes saved knowledge that becomes connected, reviewed, and resurfaced through active recall. Stages 1014 and 1016 already show relation-backed Study practice when it exists; the highest-leverage compliant next move is to let a Source overview relation row that says "No practice yet" create a single local Study card grounded to that Graph edge, then open the existing source-scoped Study Questions relation filter.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), and [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content).

## Key Changes
- Extend manual Study card creation so trusted local callers can provide bounded `source_spans` for existing source evidence, including a Graph relation `edge_id`.
- Keep the existing source-level manual-card span as the default when no explicit spans are provided.
- In Source overview related Graph connection rows:
  - keep `No practice yet` for relation rows without matching Study cards
  - add `Create practice card` for those rows
  - create a local short-answer Study card whose span references the relation edge id
  - open Study Questions scoped to the source with the existing Stage 1014 `relationEdgeId` filter
  - refresh local Study coverage so the row returns as practice-ready after reload
- Preserve the existing `Practice relation` handoff for rows that already have relation-backed cards.
- Keep Home/custom collection relation-practice queue behavior derived from existing Graph edges and Study card spans; no separate practice state is stored.
- Keep generated Reader outputs, generated Study sync, FSRS review/rating behavior, Graph review decisions, cloud/API/chat/TTS/extension capture, and AI note generation unchanged.

## Public APIs / Types
- No new endpoint is required.
- `POST /api/recall/study/cards` accepts optional `source_spans` on `StudyCardCreateRequest`.
- `StudyCardCreateRequest` gains optional bounded span metadata compatible with existing `StudyCardRecord.source_spans`.
- Existing generated OpenAPI/type contract snapshots should be updated only if they drift from the explicit optional request field.
- Workspace export/restore continues to preserve Study cards through existing `review_cards.source_spans_json`.

## Test Plan
- Backend:
  - Creating a manual Study card without explicit spans still writes the current source-level `study_manual` span.
  - Creating a manual Study card with a relation span preserves the matching `edge_id`, source id/title, excerpt, and manual relation marker.
  - Missing source and invalid payload behavior remain stable.
- Frontend:
  - Source overview relation rows without matching Study cards show `No practice yet` plus `Create practice card`.
  - Clicking `Create practice card` sends a bounded relation span, inserts the returned card locally, opens Study Questions scoped to the source, and activates the exact relation filter.
  - The newly created card is visible under the relation filter.
  - Rows with existing relation-backed Study cards keep `Practice relation` and do not show the create action.
  - Home relation-practice queue and Stage 1014 relation handoffs remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1018_source_relation_practice_gap_build_after_stage1017.mjs`.
  - Capture Source overview no-practice relation row, create practice-card action, Study relation-filter landing, Source overview practice-ready return after reload, Home relation-practice queue signal after creation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused backend `tests/test_api.py` Study-card creation tests.
  - Focused `App.test.tsx` source relation practice gap tests and Stage 1014/1016 relation-practice preservation tests.
  - API contract/OpenAPI snapshot checks if generated contracts drift.
  - Frontend typecheck, full focused Vitest where practical, build.
  - Stage 1018 Playwright audit, Stage 1016 audit preservation if needed, cleanup dry-run, and `git diff --check`.

## Assumptions
- A relation-practice card is local user-created Study content, not generated Reader output.
- The created prompt can be a simple editable short-answer card seeded from the relation labels and relation type.
- "Practice-ready" remains derived from `StudyCardRecord.source_spans[].edge_id`; no new stored coverage field is introduced.
- The card is source-owned by the open Source overview document even when the relation points to another source.
- FSRS remains owned only by Study review and rating flows.

## Implementation Result
- Added optional `StudyCardCreateRequest.source_spans` support with bounded backend normalization for manual relation-practice spans; callers that omit it still get the existing source-level `study_manual` span.
- Added Source overview `Create practice card` on related Graph rows without matching Study coverage; the action creates one local short-answer card with the relation `edge_id`, opens Study Questions with the existing source-scoped relation filter, and refreshes local Study coverage so Source/Home surfaces derive practice readiness from the new span.
- Updated frontend Study request types and regenerated OpenAPI/type contract references for the optional request field.
- Added `scripts/playwright/stage1018_source_relation_practice_gap_build_after_stage1017.mjs` for the Source no-practice create action, Study relation-filter landing, Source/Home readiness return, generated-output freeze, and cleanup dry-run evidence.
