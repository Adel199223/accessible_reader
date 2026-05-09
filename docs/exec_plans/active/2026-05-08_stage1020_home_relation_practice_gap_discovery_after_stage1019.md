# Stage 1020 Home Relation Practice Gap Discovery After Stage 1019

## Summary
Open a fresh Stage 1020/1021 slice that lifts Stage 1018's Source relation-practice gap build path back into Home/custom collection discovery. Recall's current public direction emphasizes saved knowledge, connected content, review, and active recall. Stage 1018 made Source overview relation rows with `No practice yet` actionable, but Home still only surfaces relation practice when a relation already has a matching Study card. The highest-leverage compliant move is to let Home/custom collection Reading queue rows show compact relation-practice gaps and hand off to Source overview, where the existing `Create practice card` flow owns the actual card creation.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), and [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content).

## Key Changes
- Extend the derived related-Graph summary for each source with:
  - `practiceGapRelationCount`
  - `firstPracticeGapRelationEdgeId`
- Keep practice-ready coverage derived from existing non-deleted `StudyCardRecord.source_spans[].edge_id`; do not store relation practice state.
- In Home and custom collection Reading queue rows:
  - keep existing `related source` and `practice relation` signals
  - add a compact `needs practice` / `relation needs practice` signal when a non-rejected related Graph relation has no matching Study card
  - expose `Build practice` for gap rows, opening the existing Source overview related-Graph stack instead of creating cards directly from Home
  - keep `Practice connection` as the primary action when practice-ready relation cards exist
- Preserve Stage 1018 Source overview `Create practice card` behavior as the build surface.
- After a Source overview create action, the existing Home relation-practice readiness should show the row as practice-ready after Home reload/refresh.
- Keep generated Reader outputs, generated Study sync, FSRS review/rating behavior, Graph decisions, chat/API/cloud/TTS/extension capture, and AI note generation unchanged.

## Public APIs / Types
- No new endpoint is required.
- No database migration or generated API contract drift is expected.
- Workspace export/restore remains unchanged because Graph edges and Study card `source_spans_json` already persist the derived state.

## Test Plan
- Frontend:
  - Home Reading queue rows with related Graph relations but no relation-backed Study cards show a relation-practice gap signal and `Build practice`.
  - `Build practice` opens Source overview with the existing related Graph row and `Create practice card`.
  - Rows with existing relation-backed Study cards keep `Practice connection` and practice-ready counts.
  - Custom collection Reading queue rows show the same relation-practice gap signal.
  - Source overview creation still sends a bounded relation span and lands in relation-filtered Study Questions.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1020_home_relation_practice_gap_discovery_after_stage1019.mjs`.
  - Capture Home gap signal, Home `Build practice` Source handoff, Source `Create practice card`, relation-filtered Study landing, Home readiness after creation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` relation gap, relation practice, and Stage 1018 creation tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q` if no backend changes are expected but broad confidence is needed.
  - Stage 1020 Playwright audit, Stage 1018 Playwright preservation if Source creation changes, cleanup dry-run, and `git diff --check`.

## Assumptions
- Home remains a discovery and routing surface; Source overview owns relation-practice card creation.
- If a source has both practice-ready and gap relations, `Practice connection` remains available for ready cards and `Build practice` also appears as a secondary action for the missing relation practice.
- Gap detection only needs non-rejected related Graph rows visible to the source; rejected edges remain excluded.
- FSRS remains owned only by Study review and rating flows.

## Implementation Result
- Added derived Home/custom collection relation-practice gap coverage to the related Graph source summary without adding storage or API state.
- Home/custom collection Reading queue rows now show compact `relation needs practice` copy for unpracticed related Graph relations and expose `Build practice`, which opens the existing Source overview related-Graph stack.
- Practice-ready rows still expose `Practice connection`, so mixed ready/gap sources can route directly to Study for existing practice while keeping Source overview as the build surface for missing relation cards.
- Added `scripts/playwright/stage1020_home_relation_practice_gap_discovery_after_stage1019.mjs` to capture Home, custom collection, Source build handoff, relation-filtered Study landing, Home post-build readiness, generated-output freeze, and cleanup dry-run evidence.
