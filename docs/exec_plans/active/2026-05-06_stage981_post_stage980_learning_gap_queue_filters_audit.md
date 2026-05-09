# Stage 981 - Post-Stage-980 Learning-Gap Queue Filters Audit

## Status

Completed on May 6, 2026.

## Intent

Audit that Reading queue learning filters make source triage faster without changing generated Reader outputs, local Study scheduling semantics, or Stage 976/978 highlight review behavior.

## Scope

- Confirm Home/custom collection Reading queues expose learning filters for needs review, uncovered, covered, and Study prompts.
- Confirm learning filters compose with collection scope and reading-state filters.
- Confirm backend filtering happens before `limit`, so matching sources are not hidden by earlier non-matching rows.
- Confirm Review highlights and Study prompts handoffs still route to Source overview and source-scoped Study.
- Preserve Stage 978 source learning gaps, Stage 976 highlight review filters/actions, Stage 975 reading queue/highlight-to-Study actions, Stage 970 collection workspaces, export/backup/restore, Notebook promotion semantics, Reader generated-output freeze, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `homeLearningFilterControlsVisible: true`
- `homeLearningFilterCoveredRowsOnly: true`
- `homeLearningFilterStateComposition: true`
- `homeLearningFilterStudyHandoffWorks: true`
- `readingQueueCoveredFilterBeforeLimit: true`
- `readingQueueLearningSummaryCounts: true`
- `sourceReviewHandoffStillWorks: true`
- `cleanupUtilityDryRunMatchedAfterStage980: 0`

## Validation Plan

- Backend `tests/test_api.py`: 94 passed.
- Frontend typecheck via `npx tsc -b`: passed.
- Focused frontend Reading queue tests: passed.
- Full Vitest: 265 passed, 20 skipped.
- Frontend build: passed with the existing Vite chunk-size warning.
- Contract inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoption checks: passed.
- Stage 980 Playwright evidence: passed with cleanup dry-run `matchedCount: 0`.
- Stage 978 and Stage 976 Playwright regressions: passed with cleanup dry-run `matchedCount: 0`.
- Stage 975 Playwright audit: passed with cleanup dry-run `matchedCount: 0`.
- In-app browser smoke at `http://127.0.0.1:8010/recall?section=library`: Recall Workspace loaded.
- Cleanup utility dry-run: `matchedCount: 0`.
- `git diff --check`: passed.
