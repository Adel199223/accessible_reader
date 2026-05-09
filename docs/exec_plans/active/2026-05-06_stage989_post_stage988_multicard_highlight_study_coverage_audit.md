# Stage 989 Post-Stage-988 Multi-Card Highlight Study Coverage Audit

## Summary
Audit Stage 988's card-set-aware highlight Study coverage selection. The audit must prove that a highlight/source note covered by multiple local Study cards still exposes a ready covered review target when at least one linked card is `due` or `new`, even if another linked card is newer but scheduled or unscheduled.

## Audit Scope
- Highlight inbox backend summary counts for multi-card note coverage.
- Row-level `Open Study card` handoff preference.
- `Review covered highlights` queue derivation from all reviewable linked cards.
- Covered vs uncovered vs dismissed filters.
- Existing Notebook promotion and Reader highlight handoffs.
- Study FSRS/rating semantics, generated Reader-output freeze, and cleanup hygiene.

## Validation Commands
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `node scripts/playwright/stage988_multicard_highlight_study_coverage_selection_after_stage987.mjs --base-url=<live-url>`
- Stage 986, 984, 982, 980, 978, 976, and 975 regression ladder against the same live URL.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Covered inbox rows stay one row per note when multiple cards reference the note.
- A newer unscheduled/scheduled linked card does not hide an older due/new linked card from `reviewable_study_card_ids`.
- Row-level `study_card_id` prefers a reviewable linked card when available.
- The covered-highlight review session starts from reviewable linked cards only.
- Public API shape remains stable.
- Cleanup dry-run reports `matchedCount: 0`.
- Roadmap and assistant handoff docs name Stage 988/989 as the latest completed checkpoint.

## Audit Result
- Stage 988 implementation and browser evidence passed on May 6, 2026 against `http://127.0.0.1:8000`.
- The Stage 988 Playwright validation recorded row-level reviewable-card preference, review-session card selection, explicit row `Open Study card` handoff, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Stage 986, 984, 982, 980, 978, 976, and 975 Playwright regression ladder passed against the same live URL, preserving the prior highlight-state, covered-review-session, queue-scoped review, learning-gap, and Library reading-queue baselines.
- Focused backend and frontend tests passed for the duplicate-card highlight coverage case.
- Final regression gate passed: backend `tests/test_api.py` 96 passed; frontend typecheck passed; `App.test.tsx` 171 passed; `api.test.ts` 12 passed; full Vitest 268 passed / 20 skipped; build passed with the existing Vite chunk-size warning; cleanup dry-run returned `matchedCount: 0`; `git diff --check` passed.
- Public API shape stayed stable; the behavior change is internal selection/aggregation semantics.
