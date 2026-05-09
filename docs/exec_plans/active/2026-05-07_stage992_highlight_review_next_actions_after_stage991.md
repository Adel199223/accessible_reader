# Stage 992 Highlight Review Next Actions

## Summary
Open a fresh Stage 992 slice after Stage 990/991 to make highlight review inboxes more action-oriented after the local review loop. Stage 976 made highlights durable as `unreviewed`, `reviewed`, or `dismissed`; Stage 984-990 connected covered highlights to Study sessions and recaps. The next high-leverage local-first step is to surface one compact next-action seam inside Home/custom collection and Source highlight review panels so users can move from the current review state into the next useful local action without hunting through filters.

This follows Recall's current public direction around saved knowledge, notes, review, and personal recall workflows while staying inside this repo's brief. It does not add chat, API/MCP, cloud sync, notifications, local TTS, generated Reader-output changes, or FSRS scheduling changes.

Sources: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Recall docs](https://docs.recall.it/).

## Key Changes
- Add a compact `Next action` seam to the existing highlight review inbox panel.
- Derive the next actions from existing `HighlightReviewInboxSummary` and `reviewable_study_card_ids`.
- Expose actions for:
  - practicing ready Study-covered highlights,
  - opening uncovered highlights so users can create Study cards,
  - opening remaining needs-review highlights,
  - opening reviewed highlights,
  - opening scoped Study Questions when Study coverage exists.
- Keep existing row actions and review-state buttons unchanged.
- Keep the Stage 990 covered-highlight recap return behavior unchanged.

## Public APIs / Types
- No backend schema change.
- No public endpoint change.
- No exported type change.

## Implementation Tasks
1. Frontend TDD:
   - Add focused Home/custom collection coverage proving the next-action seam appears when a reviewed inbox has uncovered highlights, and that the uncovered action selects the uncovered filter.
   - Add focused Source coverage proving a covered source inbox exposes scoped Study Questions and routes to source-scoped Questions.
2. Frontend implementation:
   - Add a local helper inside `renderHighlightReviewInboxPanel` that derives next-action copy/actions from the existing summary counts.
   - Add click handlers that reuse `setSelectedState`, `handleReviewCoveredHighlights`, `focusHomeCustomCollectionQuestions`, and `focusSourceStudyQuestions`.
   - Add stable Stage 992 data attributes for browser evidence.
3. Browser evidence:
   - Add `scripts/playwright/stage992_highlight_review_next_actions_after_stage991.mjs`.
   - Reuse local harness patterns to create a collection/source with reviewed, uncovered, and covered notes, assert the next-action seam, exercise uncovered and Study Questions handoffs, and keep cleanup dry-run `matchedCount: 0`.
4. Docs and handoff:
   - Create Stage 993 audit plan.
   - After validation, update roadmap and assistant handoff docs to name Stage 992/993 as the latest checkpoint.

## Test Plan
- Focused `frontend/src/App.test.tsx` tests for Home and Source next-action seams.
- `frontend` typecheck.
- Full `App.test.tsx`, `api.test.ts`, full Vitest, and build.
- Stage 992 Playwright evidence.
- Cleanup dry-run `matchedCount: 0`.
- `git diff --check`.

## Assumptions
- The seam is a navigation/triage aid only; it does not change note review state by itself.
- Dismissed notes remain recoverable through the existing Dismissed filter.
- Study coverage remains derived from non-deleted note-grounded Study cards.
- FSRS remains owned only by existing Study rating flows.

## Implementation Notes
- Added focused TDD coverage for Home/custom collection and Source highlight review next-action seams.
- Added the shared `Next action` seam inside the existing highlight review inbox panel without backend schema/API/type changes.
- Added `scripts/playwright/stage992_highlight_review_next_actions_after_stage991.mjs` for repeatable browser evidence.
