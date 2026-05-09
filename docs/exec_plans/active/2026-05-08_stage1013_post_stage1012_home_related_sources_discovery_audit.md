# Stage 1013 Post-Stage-1012 Home Related Sources Discovery Audit

## Summary
Audit Stage 1012's Home/custom collection related-source discovery. The audit must prove Reading queue related-source signals are derived from existing non-rejected Graph relations, open the existing Source overview detailed surface, preserve focused Graph relation handoffs, and do not disturb Stage 1010 Source overview behavior, Stage 1008 source-scoped relation review, highlight review Graph gaps, Reader outputs, FSRS, or cleanup hygiene.

## Audit Scope
- Home Reading queue related-source summary text and `Related sources` action.
- Custom collection Reading queue related-source summary text and `Related sources` action.
- Exclusion of rejected Graph relations from Reading queue related-source summaries.
- `Related sources` handoff into Source overview, with Stage 1010 `Source related Graph connections` visible.
- Stage 1010 `Open related source` and `Open relation` / `Review relation` handoffs.
- Stage 1008 source-scoped relation review scope preservation.
- Existing Graph gaps Reading queue filter and highlight review handoff preservation.
- Generated Reader-output freeze, Study FSRS ownership, and cleanup dry-run hygiene.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Home reading queue related Graph source"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "related Graph source"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph gaps lens"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1012_home_related_sources_discovery_after_stage1011.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1010_source_related_connections_after_stage1009.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Home and custom collection Reading queue rows surface related-source Graph signals only when non-rejected relations connect the row source to another saved source.
- Rejected Graph relations do not create Reading queue related-source signals.
- `Related sources` opens Source overview for the row source without changing Reader, Study, or highlight review handoffs.
- Source overview continues to show related saved-source rows and focused Graph relation handoffs from Stage 1010.
- Stage 1008 source-scoped relation review and Graph gaps Reading queue behavior remain stable.
- No backend schema, generated contract, Reader output, or FSRS behavior changes are introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- Completed.
- Browser Use first attempt was blocked before attach because the Node/browser runtime could not switch into the WSL UNC working directory (`EPERM`); the repo Playwright harness was used as the browser fallback.
- `node scripts/playwright/stage1012_home_related_sources_discovery_after_stage1011.mjs --base-url=http://127.0.0.1:8001` passed with Home/custom collection related-source signals, Source overview related rows, focused Graph relation handoff, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1010_source_related_connections_after_stage1009.mjs --base-url=http://127.0.0.1:8001` passed, preserving Stage 1010 related-source rows and handoffs.
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=http://127.0.0.1:8001` passed, preserving source-scoped Graph relation review.
- Focused frontend coverage passed: `Home reading queue related Graph source`, `Home custom collection reading queue shows related Graph source signal`, `related Graph source`, `Graph gaps lens`, and `Graph connection review`.
- Full regression passed: backend `tests/test_api.py` (`98 passed`), full `App.test.tsx` (`194 passed`), `api.test.ts` (`12 passed`), full Vitest (`291 passed`, `20 skipped`), frontend typecheck, and build with the existing Vite chunk-size warning.
- Cleanup dry-run returned `matchedCount: 0`; `git diff --check` passed.
