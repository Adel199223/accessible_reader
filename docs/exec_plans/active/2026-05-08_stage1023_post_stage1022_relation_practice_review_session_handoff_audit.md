# Stage 1023 Post-Stage-1022 Relation Practice Review Session Handoff Audit

## Summary
Audit Stage 1022's relation-practice review-session handoff. The audit must prove that practice-ready Graph relations can launch active local Study review directly from Home and Source, that non-eligible relation cards still fall back to relation-filtered Questions, and that relation review recaps route back to the source connection context without changing backend contracts, Reader outputs, Graph storage, or FSRS ownership.

Status: completed on 2026-05-08.

## Audit Scope
- Home Reading queue `Practice connection` starts a relation-scoped Study review session when the relation has due/new Study cards.
- Source overview `Practice relation` starts the same relation-scoped Study review session.
- Relation cards that are not review-eligible preserve the existing relation-filtered Questions handoff.
- Completing/rating a relation session shows `Connection practiced` recap language.
- Recap `Back to source connection` returns to Source overview for the source.
- Recap `Study questions` returns to Study Questions with the same relation filter.
- Stage 1020 Home `Build practice`, Stage 1018 Source `Create practice card`, generated Reader outputs, cleanup dry-run hygiene, public API shape, and Study FSRS rating flow remain stable.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice"`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1022_relation_practice_review_session_handoff_after_stage1021.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Practice-ready relation actions start Review directly, not just Questions.
- Non-eligible relation cards still open relation-filtered Questions.
- Relation review recap returns to both Source connection context and Study Questions.
- No new backend endpoint, database schema, generated Reader-output, cloud/chat/TTS/extension capture, or non-Study FSRS behavior is introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- Browser Use first attempt was blocked by the installed Browser plugin cache missing `browser-use/0.1.0-alpha2/scripts/browser-client.mjs`; repo Playwright fallback was used and recorded the blocker in the validation JSON.
- `scripts/playwright/stage1022_relation_practice_review_session_handoff_after_stage1021.mjs --base-url http://127.0.0.1:8001` passed with `homePracticeConnectionStartsSession`, `collectionPracticeConnectionStartsSession`, `sourcePracticeRelationStartsSession`, `relationPracticeSessionRecapVisible`, `relationPracticeRecapReturnOpensSourceConnection`, `generatedReaderOutputsFrozen`, and cleanup dry-run `matchedCount: 0`.
- Captures written under `output/playwright/`: `stage1022-home-practice-connection.png`, `stage1022-collection-practice-connection.png`, `stage1022-home-practice-active-session.png`, `stage1022-relation-practice-recap.png`, `stage1022-relation-practice-return-to-source.png`, `stage1022-source-practice-relation.png`, and `stage1022-source-practice-active-session.png`.
- Backend `tests/test_api.py`, frontend typecheck/build, focused relation-practice tests, full `App.test.tsx`, `api.test.ts`, full Vitest rerun, and cleanup dry-run passed.
