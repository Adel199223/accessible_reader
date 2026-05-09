# Stage 986 Study Review Completion Marks Linked Highlights Reviewed

## Summary
Close the Stage 984/985 covered-highlight handoff loop by making actual Study practice update the local highlight review state. When a user rates a Study card that is grounded in one or more `recall_notes` through `review_cards.source_spans[].note_id`, those linked highlight/source notes should become `reviewed` in the same local review transaction.

This keeps Recall's learning loop pointed at saved knowledge, notes, review, and personal recall while staying inside this repo's local-first scope. It does not change Reader generated outputs, Study card generation, FSRS scheduling semantics, cloud/API/chat behavior, or Notebook promotion handoffs.

Sources: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Recall docs](https://docs.recall.it/).

## Key Changes
- Add storage behavior inside `review_study_card`: after a successful rating event is recorded, parse the card's existing `source_spans_json` and find unique linked `note_id` values.
- Mark existing linked notes `reviewed` only when their current review state is `unreviewed`; set `reviewed_at`, `review_state_updated_at`, and `updated_at`.
- Preserve explicitly `dismissed` linked notes so Study practice does not undo a user-owned dismissal.
- Append local `recall_note` change events for notes whose state changes, with the source document and review card id in the payload.
- Keep non-note-grounded cards unchanged.
- Keep deleted Study cards 404 behavior unchanged.
- Preserve existing review card response shape and OpenAPI surface; no new API type is required.

## Public APIs / Types
- No new endpoint.
- `POST /api/recall/study/cards/{card_id}/review` keeps returning `StudyCardRecord`.
- Existing note review fields in highlight inbox responses reflect the state transition on subsequent reads.

## Implementation Tasks
1. Backend TDD:
   - Add a focused `backend/tests/test_api.py` test that creates a note, promotes it to a Study card, restores the note to `unreviewed`, rates the card, and verifies the linked note is now `reviewed` plus the highlight inbox no longer reports it as needing review.
   - Add a second assertion path for a dismissed linked note staying dismissed after Study practice, proving dismissal is not silently undone.
2. Backend storage:
   - Add a private helper near the review-state helpers to extract linked note ids from `source_spans_json` and mark them reviewed within the existing connection.
   - Call it from `review_study_card` after the review event insert and before returning the updated card.
3. Browser evidence:
   - Add a Stage 986 Playwright harness that creates a disposable source, note, covered card, restores the note to unreviewed, launches `Review covered highlights`, rates the card, and verifies via the highlight inbox API that the note moved to reviewed.
   - Preserve row-level `Open Study card`, Notebook promotion, generated Reader-output freeze, and cleanup dry-run `matchedCount: 0` in the evidence set.
4. Docs and audit:
   - Create Stage 987 audit plan.
   - Update `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, `agent.md`, and `docs/assistant/INDEX.md` after validation.

## Test Plan
- Backend:
  - Focused new Study rating/highlight state test.
  - Existing `tests/test_api.py`.
- Frontend:
  - Typecheck.
  - Focused `App.test.tsx`.
  - Full Vitest.
  - Build.
- Browser:
  - New Stage 986 Playwright evidence.
  - Stage 984, 982, 980, 978, 976, and 975 regression ladder.
  - Cleanup dry-run `matchedCount: 0`.
- Hygiene:
  - Contract checks only if public API schema changes unexpectedly.
  - `git diff --check`.

## Assumptions
- A rated Study card means the user has reviewed the linked highlight/source note if that note is still `unreviewed`.
- Marking an already reviewed linked note again should not churn its timestamp or change events.
- Dismissed linked notes stay dismissed because dismissal is an explicit user triage choice.
- FSRS remains owned only by the existing Study rating flow.
