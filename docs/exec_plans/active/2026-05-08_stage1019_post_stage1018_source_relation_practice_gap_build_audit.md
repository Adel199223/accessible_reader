# Stage 1019 Post-Stage-1018 Source Relation Practice Gap Build Audit

## Summary
Audit Stage 1018's Source relation practice gap build loop. The audit must prove that a related Graph connection with no relation-backed Study card can create one local manual card grounded to the existing edge id, land in the existing Study Questions relation filter, and return to the Source/Home relation-practice surfaces as practice-ready without changing generated outputs, FSRS ownership, or stored Graph state.

## Audit Scope
- Source overview related Graph connection rows without matching Study cards show `No practice yet` and `Create practice card`.
- `Create practice card` creates a local Study card through `POST /api/recall/study/cards` with a bounded relation span containing the Graph edge id.
- The handoff lands in Study Questions scoped to the source and filtered to that relation edge id.
- The newly created card is visible under the relation filter, and clearing the filter returns to broader source-scoped questions.
- Returning to Source overview shows the row as practice-ready with the existing `Practice relation` action.
- Home/custom collection Reading queue relation-practice signals derive the new card from existing span metadata.
- Existing Stage 1014/1016 relation-practice behavior, generated Reader-output freeze, Study FSRS ownership, and cleanup dry-run hygiene remain intact.

## Validation Commands
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q -k "study_card"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice|no practice state|Home reading queue relation practice|Home custom collection reading queue shows relation practice"`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- Contract/OpenAPI snapshot checks if `StudyCardCreateRequest` drift is detected.
- `node scripts/playwright/stage1018_source_relation_practice_gap_build_after_stage1017.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Relation-practice gaps can be closed from Source overview in one local action.
- The created Study card carries the relation edge id in `source_spans`.
- Study relation filter, Source overview practice readiness, and Home relation-practice queue all derive from the same span metadata.
- No new backend endpoint, database schema, separate practice state, Reader-output generation change, or FSRS behavior change is introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Result
- `backend/.venv/bin/python -m pytest tests/test_api.py::test_recall_study_manual_question_creation_preserves_source_owned_cards -q` - passed.
- `backend/.venv/bin/python -m pytest tests/test_api.py -q -k "study_card"` - 4 passed, 94 deselected.
- `backend/.venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- `npm test -- --run src/App.test.tsx --reporter=dot -t "Source overview relation rows can create"` - 1 passed, 197 skipped.
- `npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice|no practice state|Home reading queue relation practice|Home custom collection reading queue shows relation practice"` - 3 passed, 195 skipped.
- `npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `npm exec tsc -- -b --pretty false` - passed.
- `npm run build` - passed with the existing Vite chunk-size warning.
- API contract inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoption checks - passed.
- Browser Use in-app smoke at `http://127.0.0.1:8001/recall?section=library` loaded the rebuilt Recall Workspace during Stage 1018 validation.
- `node scripts/playwright/stage1018_source_relation_practice_gap_build_after_stage1017.mjs --base-url=http://127.0.0.1:8018` - passed with `createdCardHasRelationSpan: true`, `studyRelationFilterShowsCreatedCard: true`, `sourcePracticeReadyAfterCreate: true`, `homeRelationPracticeQueueSignalAfterCreate: true`, `generatedReaderOutputsFrozen: true`, and cleanup `matchedCount: 0`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.
- Full `frontend/src/App.test.tsx` was attempted twice and exposed broad-file timing flakes in older shell/search-control readiness tests. The failing target shifted across reruns, and focused Stage 1018/relations tests plus backend, API, contracts, typecheck, build, Browser smoke, and Playwright audit all passed; do not record this as a full `App.test.tsx` green pass.
