# Stage 1021 Post-Stage-1020 Home Relation Practice Gap Discovery Audit

## Summary
Audit Stage 1020's Home/custom collection relation-practice gap discovery. The audit must prove that Home can reveal relation-practice gaps, route them to the existing Source overview build surface, and return to practice-ready derived coverage after a Source-created Study card without changing backend contracts, Reader outputs, stored Graph state, or FSRS behavior.

## Audit Scope
- Home Reading queue rows with related Graph relations and no matching `source_spans[].edge_id` Study card show a compact relation-practice gap signal.
- `Build practice` opens Source overview for that source, where the existing related Graph row shows `No practice yet` and `Create practice card`.
- Creating the card through Source overview preserves the Stage 1018 bounded relation span and opens relation-filtered Study Questions.
- Returning/reloading Home derives practice-ready relation state from the new card span.
- Custom collection Reading queue rows show the same gap signal and handoff.
- Existing practice-ready rows still show `Practice connection`, Stage 1018 Source creation remains stable, generated Reader outputs remain frozen, and cleanup dry-run hygiene remains intact.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice gap|relation practice|no practice state|Home reading queue relation practice|Home custom collection reading queue"`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1020_home_relation_practice_gap_discovery_after_stage1019.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Home and custom collection queues expose relation-practice gaps without creating Study cards directly.
- Source overview remains the single build surface for relation-practice card creation.
- Practice-ready and gap signals are derived from existing Graph edges plus Study card spans.
- No backend endpoint, database schema, generated API contract, Reader-output, or FSRS behavior change is introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Result
- PASS: Stage 1020 Playwright audit on a fresh local server (`http://127.0.0.1:8020`) captured Home and custom collection relation-practice gap signals, Home `Build practice` Source overview handoff, Source `Create practice card`, relation-filtered Study landing, Source/Home practice-ready state after creation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- PASS: Browser Use was attempted first, but the installed Browser plugin cache is missing its required `scripts/browser-client.mjs`; repo Playwright was used as the fallback evidence path.
- PASS: Backend `tests/test_api.py -q` completed with 98 passed.
- PASS: Frontend focused relation-practice tests, full `App.test.tsx` (198 passed), `api.test.ts` (12 passed), full Vitest (295 passed, 20 skipped), typecheck, and build completed successfully.
- PASS: API/type contract inventory completed with no failing drift signal.
- PASS: Cleanup dry-run against the live app at `http://127.0.0.1:8001` returned `matchedCount: 0`.
- PASS: `git diff --check` completed successfully.
