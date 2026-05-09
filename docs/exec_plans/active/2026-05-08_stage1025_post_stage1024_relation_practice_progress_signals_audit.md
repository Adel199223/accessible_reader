# Stage 1025 Post-Stage-1024 Relation Practice Progress Signals Audit

## Summary
Audit Stage 1024's relation practice progress signals and focused return loop. The audit must prove that practiced/scheduled relation cards no longer look like ready live-review launchers, that ready due/new relation cards still start active Study review sessions, and that completed relation-practice sessions return to the exact Source relation context without changing backend contracts, Reader outputs, Graph storage, or FSRS ownership.

Status: completed on 2026-05-08.

## Audit Scope
- Home/custom collection Reading queue shows ready relation practice only for due/new relation-backed Study cards.
- Home/custom collection Reading queue shows practiced/scheduled/unscheduled relation progress for non-ready relation cards and routes those rows to relation-filtered Study Questions.
- Source overview relation rows show compact relation practice progress and expose `Practice relation`, `Study questions`, or `Create practice card` according to derived state.
- Relation-practice review sessions still start from Home and Source when due/new cards exist.
- Relation-practice recap `Back to source connection` returns to Source overview with the practiced relation row visibly focused.
- Stage 1020 gap/build, Stage 1018 create-practice-card, generated Reader outputs, cleanup dry-run hygiene, public API shape, and Study FSRS rating flow remain stable.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice"`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1024_relation_practice_progress_signals_after_stage1023.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Ready relation signals and `Practice connection` / `Practice relation` appear only when a due/new queue exists.
- Practiced/scheduled relation cards remain visible as progress, not as no-card gaps.
- Relation-filtered Study Questions remains the fallback for non-ready relation cards.
- Relation session recap can return to a focused Source relation row.
- No new backend endpoint, database schema, generated Reader-output, cloud/chat/TTS/extension capture, import behavior, or non-Study FSRS behavior is introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- In-app browser tooling opened the live app at `http://127.0.0.1:8001/recall` and confirmed title `Recall Workspace`; repo Playwright covered the seeded browser evidence flow.
- `scripts/playwright/stage1024_relation_practice_progress_signals_after_stage1023.mjs --base-url http://127.0.0.1:8001` passed with `homePracticeConnectionStartsSession`, `sourcePracticeRelationStartsSession`, `homePracticedScheduledStateVisible`, `sourcePracticedScheduledStateVisible`, `relationPracticeRecapReturnFocusesSourceConnection`, `generatedReaderOutputsFrozen`, and cleanup dry-run `matchedCount: 0`.
- Captures written under `output/playwright/`: `stage1024-home-practice-connection.png`, `stage1024-collection-practice-connection.png`, `stage1024-home-practice-active-session.png`, `stage1024-relation-practice-recap.png`, `stage1024-relation-practice-return-to-source.png`, `stage1024-home-practiced-scheduled-state.png`, `stage1024-source-practice-relation.png`, and `stage1024-source-practice-active-session.png`.
- Focused relation-practice tests, frontend typecheck, and build passed before the browser audit.
- Backend `tests/test_api.py` passed with 98 tests.
- Full `src/App.test.tsx` passed with 201 tests.
- Frontend API tests passed with 12 tests.
- Full Vitest passed with 298 tests and 20 skipped.
- Cleanup dry-run stayed at `matchedCount: 0`.
- `git diff --check` passed.
