# Stage 979 - Post-Stage-978 Source Learning Gaps Audit

## Status

Completed on May 6, 2026.

## Intent

Audit that source learning-gap and next-action signals connect Reading queue, highlight review, and Study coverage without changing generated Reader outputs, local Study scheduling semantics, or Stage 976 review-state behavior.

## Scope

- Confirm Home/custom collection reading queue rows expose per-source highlight review counts.
- Confirm Review highlights signals open Source overview with the existing source-scoped highlight review controls.
- Confirm Study prompt signals open source-scoped Study without mutating FSRS.
- Confirm Source overview learning-gap summary matches the source highlight review inbox summary and updates after review-state changes.
- Preserve Stage 976 highlight review filters/actions, Stage 975 reading queue/highlight-to-Study actions, Stage 972 highlight/resume continuity, Stage 970 collection workspaces, export/backup/restore, Notebook promotion semantics, Reader generated-output freeze, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `homeReadingQueueLearningGapsVisible`
- `homeReadingQueueReviewHighlightsHandoff`
- `homeReadingQueueStudyPromptHandoff`
- `sourceOverviewLearningGapSummaryVisible`
- `sourceOverviewSummaryUpdatesAfterDismissRestore`
- `sourceLearningGapsStudyCoverageDerived`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run backend `tests/test_api.py`.
- Run focused frontend tests around Reading queue, highlight review, and Source overview.
- Run frontend typecheck, full Vitest, and build.
- Run Stage 978 Playwright evidence, then Stage 976/975 regression scripts.
- Run cleanup dry-run and `git diff --check`.

## Results

- Stage 978 evidence passed with Home Reading queue learning-gap chips/actions, Review highlights handoff, Study prompts handoff, Source overview learning-gap summary, Source overview dismiss/restore summary updates, derived Study coverage, and cleanup dry-run `matchedCount: 0`.
- Stage 976 regression passed with Home collection highlight review filters, reviewed/dismissed/restore actions, covered Study handoff, Source overview controls, Notebook promotion seam, and cleanup dry-run `matchedCount: 0`.
- Stage 975 regression passed with reading queue/highlight actions plus Add Content, collection tree/workspaces, Reader quiz, source learning export, backup/restore, generated-output freeze, and cleanup regressions.
- Backend `tests/test_api.py`, full frontend Vitest, typecheck/build, contract audits, direct cleanup dry-run, and `git diff --check` passed.
