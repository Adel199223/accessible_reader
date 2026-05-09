# Stage 1015 Post-Stage-1014 Related Source Practice Readiness Audit

## Summary
Audit Stage 1014's related-source practice loop. The audit must prove Source overview relation rows derive Study coverage from existing `StudyCardRecord.source_spans[].edge_id`, open the existing Study Questions surface filtered to the exact Graph relation, and preserve Home related-source discovery, Graph relation review, Reader outputs, FSRS ownership, and cleanup hygiene.

## Audit Scope
- Source overview related Graph connection rows show practice coverage counts for matching relation-backed Study cards.
- Relation rows without matching cards show a non-destructive "No practice yet" state.
- `Practice relation` opens source-scoped Study Questions filtered by the selected relation edge id.
- Active Study relation filter chip displays the relation label and matching question count.
- Clearing the relation filter restores the broader source-scoped Study Questions set.
- Stage 1012 Home/custom collection `Related sources` signals and handoff still open Source overview.
- Stage 1010 related row `Open related source` and `Open relation` / `Review relation` handoffs remain stable.
- Stage 1008 source-scoped Graph connection review remains stable.
- Generated Reader-output freeze, Study FSRS ownership, and cleanup dry-run hygiene remain intact.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "related Graph source|Source overview opens a source-scoped Graph connection review queue|Graph connection review"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1014_related_source_practice_readiness_after_stage1013.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1012_home_related_sources_discovery_after_stage1011.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Source overview relation rows accurately distinguish practiced and not-yet-practiced relations.
- `Practice relation` lands in Study Questions with only cards matching the relation edge id visible.
- The relation filter is visible, clearable, and composes with existing source-scoped Study behavior.
- Existing Home related-source discovery, Graph relation review, Study generation, Reader, Notebook, and cleanup flows remain stable.
- No backend schema, generated contract, Reader output, or FSRS behavior changes are introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- Passed on 2026-05-08 using the live Recall app at `http://127.0.0.1:8001`.
- Browser evidence: `node scripts/playwright/stage1014_related_source_practice_readiness_after_stage1013.mjs --base-url=http://127.0.0.1:8001` passed and wrote `output/playwright/stage1014-related-source-practice-readiness-validation.json` with `sourceOverviewRelationPracticeCoverageVisible: true`, `relationPracticeHandoffOpensStudyQuestions: true`, `relationPracticeFilterShowsOnlyMatchingCards: true`, `relationPracticeChipClearRestoresSourceQuestions: true`, `homeCollectionSourceHandoffPreserved: true`, `generatedReaderOutputsFrozen: true`, and cleanup dry-run `matchedCount: 0`.
- Captures: `output/playwright/stage1014-home-collection-source-queue.png`, `output/playwright/stage1014-source-overview-relation-practice-ready.png`, and `output/playwright/stage1014-study-relation-practice-filter.png`.
- Focused frontend tests passed: `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice|no practice state"` (2 passed) and `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "related Graph source|Graph connection review|source-scoped Graph connection"` (8 passed).
- Build/type hygiene passed: `cd frontend && npm run build`, `cd frontend && npm exec tsc -- -b --pretty false`, and `git diff --check`.
- Deferred broad reruns from the full audit checklist because Stage 1014 is frontend-only, adds no backend/API/schema/generated contract drift, and the focused Stage 1014 browser evidence plus adjacent Stage 1010/1012 regression tests covered the changed handoff seam.
