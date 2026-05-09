# Stage 996 Highlight Review Guided Triage Session After Stage 995

## Summary
Turn the managed highlight review inbox into a focused local review loop. Stage 994 made selected visible rows batchable; Stage 996 adds a lightweight guided session inside the existing Home/custom collection and Source highlight review panels so a user can work one visible highlight at a time, advance through the queue, and use the existing Reader, Notebook, Study, reviewed, dismissed, and restore handoffs without adding backend state.

## Scope
- Add a guided review session seam to the shared highlight review inbox renderer.
- Let Home/custom collection and Source surfaces start a session from either selected visible rows or all visible rows.
- Show current progress, active highlight preview, local review state, Study coverage, source title, and the active row's existing action set.
- Let reviewed, dismissed, and restore actions advance to the next queued visible highlight.
- Preserve row-level actions, Stage 992 next actions, Stage 994 bulk triage, covered-highlight Study review sessions, recap returns, and existing filters.
- Keep persisted state owned by `PATCH /api/recall/notes/{note_id}/review-state`.

## Out Of Scope
- No database/schema/API changes.
- No separate promoted state or stored session state.
- No Reader generated-output changes.
- No FSRS scheduling changes outside existing Study review/rating flows.
- No generated or AI-created note/card content.

## Implementation Plan
1. Add per-surface guided session state in `frontend/src/components/RecallWorkspace.tsx`.
2. Extend `renderHighlightReviewInboxPanel` with session queue helpers, start/clear/advance behavior, and session-aware review-state updates.
3. Render a compact `Review session` seam above the row list with visible/selected start buttons, progress, active highlight preview, and existing handoff/actions.
4. Add CSS for the session seam in `frontend/src/index.css` without changing the visual baseline of rows or cards.
5. Add focused `frontend/src/App.test.tsx` coverage for Home guided session advancement and Source selected-session scoping.
6. Add a Stage 996 Playwright harness that exercises Home and Source guided sessions, captures evidence screenshots, verifies generated-output freeze, and leaves cleanup dry-run at `matchedCount: 0`.
7. Update continuity docs after validation so Stage 996/997 are the latest completed checkpoint.

## Test Plan
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `python -m pytest -q tests/test_api.py`
- `node scripts/playwright/stage996_highlight_review_guided_triage_session_after_stage995.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Home/custom collection highlight review can start a visible guided session and advance after marking highlights reviewed or dismissed.
- Source highlight review can start a selected-only guided session without updating unselected visible rows.
- Session actions reuse existing Reader, Notebook, Study, and review-state pathways.
- Existing filters, bulk triage, covered-highlight Study review session handoff, and recap return behavior remain stable.
- Generated Reader outputs remain frozen.
- Cleanup dry-run reports `matchedCount: 0`.
