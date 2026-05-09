# Stage 990 Covered Highlight Review Recap Return Loop

## Summary
Open a fresh Stage 990 slice after Stage 988/989 to make covered-highlight Study practice feel like a complete local review loop. Stage 984 made `Review covered highlights` start a Study session, Stage 986 marked linked highlights reviewed after practice, and Stage 988 made the covered-card selection card-set aware. The remaining product gap is the user-visible finish: after completing that covered-highlight session, the Study recap should say what happened and offer a direct return to the originating Home collection or Source highlight inbox.

This follows Recall's current public direction around saved knowledge, notes, review, and personal recall workflows while staying inside this repo's local-first brief. It does not add chat, API/MCP, cloud sync, notifications, local TTS, generated Reader-output changes, or FSRS scheduling changes.

Sources: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Recall docs](https://docs.recall.it/).

## Key Changes
- Carry review-session origin metadata from `Review covered highlights` into the existing Study recap state.
- When the launch intent is `highlight-covered-review`, show a compact recap line that the covered highlights were practiced and their linked highlight review state was refreshed.
- Add return actions:
  - Home / custom collection sessions return to Library highlight review with `Reviewed` selected.
  - Source sessions return to the Source overview highlight review with `Reviewed` selected.
  - All covered-highlight recaps can open the Study Questions view with the same source or collection scope.
- Refresh Study, progress, and highlight inbox data after session completion through existing local reload paths.
- Preserve row handoffs: Reader highlight, Notebook source context, row-level Open Study card, and Notebook promotion remain unchanged.

## Public APIs / Types
- No backend schema change.
- No public endpoint change.
- Frontend-only extension to local `StudyReviewSessionState` and `StudyReviewSessionRecap` metadata for session origin.

## Implementation Tasks
1. Frontend TDD:
   - Add focused `App.test.tsx` coverage for a Home/custom collection covered-highlight session that rates the active card, shows the highlight recap, and returns to the collection highlight inbox with `Reviewed` selected.
   - Add focused coverage for the Source overview variant if the existing test seams allow it without broad fixture churn.
2. Frontend implementation:
   - Store the `filterSnapshot` passed to `startStudyReviewSessionForQueue` inside local session state.
   - Derive recap origin from `filterSnapshot.launch_intent`.
   - Render covered-highlight recap copy and actions inside the existing `renderStudySessionRecap`.
   - Add helpers that return to source or Home collection highlight review while preserving local scope and selecting `reviewed`.
   - Trigger the existing `reloadToken` after covered-highlight session completion so Home/Source inbox counts refresh.
3. Browser evidence:
   - Add `scripts/playwright/stage990_covered_highlight_review_recap_return_loop_after_stage989.mjs`.
   - Reuse Stage 986/988 harness patterns to create a covered note/card, launch `Review covered highlights`, rate it, assert the recap, return to highlight review, and verify reviewed state plus cleanup dry-run `matchedCount: 0`.
4. Docs and handoff:
   - Create Stage 991 audit plan.
   - After validation, update roadmap and assistant handoff docs to name Stage 990/991 as the latest checkpoint.

## Test Plan
- Focused `frontend/src/App.test.tsx` tests for covered-highlight recap return behavior.
- `frontend` typecheck.
- Full `App.test.tsx`, `api.test.ts`, full Vitest, and build.
- Stage 990 Playwright evidence.
- Stage 988, 986, 984, 982, 980, 978, 976, and 975 regression ladder as time allows against the same live URL.
- Cleanup dry-run `matchedCount: 0`.
- `git diff --check`.

## Implementation Results
- Extended local Study review-session and recap state with the existing `filterSnapshot` so covered-highlight sessions can identify their Home/custom collection or Source origin without changing backend APIs.
- Added covered-highlight recap copy/actions inside the existing Study recap: `Covered highlights practiced`, reviewed-highlight count, origin-aware return action, and scoped Study Questions follow-up.
- Added return helpers that select `Reviewed` in collection/Home highlight review or Source overview highlight review, and refresh the local reload token after covered-highlight session completion.
- Kept row-level Study, Notebook, Reader, and Notebook promotion handoffs unchanged.

## Validation Results
- `cd frontend && npm test -- --run src/App.test.tsx -t "covered highlight review sessions" --reporter=dot` - 2 passed, 171 skipped.
- `cd frontend && npm exec tsc -- -b --pretty false` - passed.
- `cd frontend && npm run build` - passed with the existing Vite chunk-size warning.
- `node --check scripts/playwright/stage990_covered_highlight_review_recap_return_loop_after_stage989.mjs` - passed.
- `node scripts/playwright/stage990_covered_highlight_review_recap_return_loop_after_stage989.mjs --base-url=http://127.0.0.1:8000` - passed with Home/custom collection recap return, Source recap return, refreshed covered queue, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q` - 96 passed.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot` - 173 passed.
- `cd frontend && npm test -- --run --reporter=dot` - 270 passed, 20 skipped.
- Browser Use in-app smoke at `http://127.0.0.1:8000/recall` - Recall Workspace loaded with Reading queue and Review highlights present and zero warning/error console logs; in-app screenshot capture timed out, so Stage 990 Playwright screenshots remain the visual evidence.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.

## Assumptions
- Reviewing a Study card linked to a highlight remains the signal that the highlight has been reviewed.
- Dismissed highlights stay recoverable and are not restored by this recap.
- The recap is local UI state; durable review history remains owned by existing Study review/session records and `recall_notes.review_state`.
- FSRS remains owned only by existing Study rating flows.
