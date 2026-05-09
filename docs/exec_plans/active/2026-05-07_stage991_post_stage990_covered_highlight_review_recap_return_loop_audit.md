# Stage 991 Post-Stage-990 Covered Highlight Review Recap Return Loop Audit

## Summary
Audit Stage 990's origin-aware covered-highlight Study recap and return loop. The audit must prove that covered-highlight sessions started from Home/custom collections and Source overview now finish with an understandable recap, refresh local highlight review state, and return to the originating review surface without changing Study rating semantics or Reader generated outputs.

## Audit Scope
- Home/custom collection `Review covered highlights` completion recap.
- Source overview `Review covered highlights` completion recap.
- Return actions to reviewed highlight inbox state.
- Study Questions follow-up action preserving source or collection scope.
- Existing row-level Reader, Notebook, Study, and promotion handoffs.
- Stage 988 multi-card coverage preference and Stage 986 review-state completion behavior.
- Cleanup dry-run hygiene.

## Validation Commands
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `node scripts/playwright/stage990_covered_highlight_review_recap_return_loop_after_stage989.mjs --base-url=<live-url>`
- Stage 988, 986, 984, 982, 980, 978, 976, and 975 regression ladder against the same live URL.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Completing a covered-highlight Study session shows a recap labeled for practiced highlights.
- Home/custom collection return selects the original collection context and the `Reviewed` highlight filter.
- Source return selects the original source overview and the `Reviewed` highlight filter.
- Study Questions follow-up preserves source scope or custom collection filter.
- Highlight inbox counts refresh after session completion.
- No FSRS scheduling semantics, generated Reader outputs, or backend API contracts change.
- Cleanup dry-run reports `matchedCount: 0`.
- Roadmap and assistant handoff docs name Stage 990/991 as the latest completed checkpoint after validation.

## Audit Results
- `node scripts/playwright/stage990_covered_highlight_review_recap_return_loop_after_stage989.mjs --base-url=http://127.0.0.1:8000` - passed with `highlightReviewSessionRecapVisible: true`, collection reviewed-inbox return, Source reviewed-inbox return, refreshed covered queue, Reader generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Stage 990 screenshots captured under `output/playwright/` for collection covered highlights before review, collection Study recap, collection reviewed highlights after return, Source covered highlights before review, Source Study recap, and Source reviewed highlights after return.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q` - 96 passed.
- `cd frontend && npm exec tsc -- -b --pretty false` - passed.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot` - 173 passed.
- `cd frontend && npm test -- --run --reporter=dot` - 270 passed, 20 skipped.
- `cd frontend && npm run build` - passed with the existing Vite chunk-size warning.
- Browser Use in-app smoke at `http://127.0.0.1:8000/recall` - Recall Workspace loaded with Reading queue and Review highlights present and zero warning/error console logs; in-app screenshot capture timed out, so Stage 990 Playwright screenshots remain the visual evidence.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.
