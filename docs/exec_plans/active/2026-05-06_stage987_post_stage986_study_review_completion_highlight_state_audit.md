# Stage 987 Post-Stage-986 Study Review Completion Highlight State Audit

## Summary
Audit the Stage 986 change that lets Study review completion mark linked highlight/source notes as reviewed. The audit must prove the local review loop closes without mutating Reader generated outputs, Study scheduling semantics beyond the existing rating operation, or unrelated Home/Source/Notebook row handoffs.

## Audit Scope
- Covered-highlight Study review sessions launched from Home/custom collection and Source overview.
- Direct Study card rating for note-grounded cards.
- Highlight inbox state after a linked card is rated.
- Dismissed note preservation through Study practice.
- Existing Create Study card and Open Study card row actions.
- Generated Reader output freeze and cleanup hygiene.

## Validation Commands
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `node scripts/playwright/stage986_study_review_completion_marks_linked_highlights_reviewed_after_stage985.mjs --base-url=<live-url>`
- Stage 984, 982, 980, 978, 976, and 975 Playwright regression ladder against the same live URL.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Linked note-grounded Study ratings mark unreviewed notes reviewed.
- Linked dismissed notes stay dismissed after practice and remain recoverable through the existing filters.
- Already reviewed linked notes do not churn note review timestamps on later card ratings.
- Non-note-grounded Study ratings do not mutate note review state.
- Browser evidence records cleanup dry-run `matchedCount: 0`.
- Roadmap and assistant handoff docs name Stage 986/987 as the latest completed checkpoint.
