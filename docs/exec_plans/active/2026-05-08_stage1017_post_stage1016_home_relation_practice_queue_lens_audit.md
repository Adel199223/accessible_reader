# Stage 1017 Post-Stage-1016 Home Relation Practice Queue Lens Audit

## Summary
Audit Stage 1016's Home/custom collection relation-practice queue lens. The audit must prove Reading queue rows derive relation-backed practice readiness from existing Graph edges and Study card `source_spans[].edge_id`, open existing source-scoped Study Questions with the exact relation filter, and preserve Source overview relation practice, Home related-source discovery, Reader outputs, cleanup hygiene, local-first contracts, and Study FSRS ownership.

## Audit Scope
- Home Reading queue rows show a compact positive relation-practice signal only when a non-rejected related Graph relation has matching relation-backed Study cards.
- Custom collection Reading queue rows show the same relation-practice signal and direct handoff.
- Rows with related sources but no relation-backed Study cards keep `Related sources` and do not show a misleading practice action.
- `Practice connection` opens Study Questions scoped to the source and filtered by the selected relation edge id.
- Active Study relation filter chip displays the relation label and matching question count.
- Clearing the relation filter restores broader source-scoped Study Questions.
- Stage 1012 `Related sources` handoff still opens Source overview.
- Stage 1014 Source overview `Practice relation` handoff remains stable.
- Generated Reader-output freeze, Study FSRS ownership, and cleanup dry-run hygiene remain intact.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Home reading queue relation practice|Home custom collection relation practice|related Graph source|relation practice|no practice state"`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `node scripts/playwright/stage1016_home_relation_practice_queue_lens_after_stage1015.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Home and custom collection queue rows distinguish practice-ready related connections from merely related sources.
- The direct Home practice handoff lands in Study Questions with only relation-backed cards visible.
- Existing Source overview relation-practice and related-source handoffs remain stable.
- No backend schema, generated contract, Reader output, or FSRS behavior changes are introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- Passed after Stage 1016 implementation.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Home reading queue relation practice|Home custom collection reading queue shows relation practice|related Graph source|relation practice|no practice state"` - 8 passed, 190 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false` - passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build` - passed with the existing Vite chunk-size warning.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node --check scripts/playwright/stage1016_home_relation_practice_queue_lens_after_stage1015.mjs` - passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1016_home_relation_practice_queue_lens_after_stage1015.mjs --base-url=http://127.0.0.1:8001` - passed with Home/custom collection relation-practice queue signals, direct Study relation-filter handoff/clear, Stage 1014 Source overview preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- git diff --check` - passed.
- Evidence written to `output/playwright/stage1016-home-relation-practice-queue-lens-validation.json` plus screenshots `stage1016-home-relation-practice-queue-signal.png`, `stage1016-custom-collection-relation-practice-queue-signal.png`, `stage1016-study-relation-practice-from-home-queue.png`, and `stage1016-source-overview-relation-practice-preserved.png`.
