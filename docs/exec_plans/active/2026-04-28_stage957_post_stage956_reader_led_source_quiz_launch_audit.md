# Stage 957 - Post-Stage-956 Reader-Led Source Quiz Launch Audit

## Status

Pre-staged on 2026-04-28.

## Intent

Audit that Reader-led source quiz launch works end to end while preserving the completed Stage 946-955 Study baselines and broader Recall source-memory/Reader regression surfaces.

## Scope

- Confirm Reader source-strip Study CTA chooses `Start source quiz`, `Study questions`, or `Generate questions` based on active source cards.
- Confirm the short-document completion strip includes the same source Study CTA without displacing Source or Notebook notes.
- Confirm `Start source quiz` opens source-scoped Study, starts one persisted session, applies Study settings, and advances through the existing attempt/rating flow.
- Confirm `Generate questions` opens source-scoped Study generation controls without automatically generating cards.
- Confirm Source overview review actions use the same source-scoped launch model and refresh counts after generation/review.
- Preserve Reader generated outputs, Home discovery-only behavior, Source memory search, Notebook/Graph handoffs, Add Content, Study generation/attempt/support/session/habit behavior, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `readerSourceQuizStartCtaVisible`
- `readerSourceQuizQuestionsCtaVisible`
- `readerSourceQuizGenerateCtaVisible`
- `readerShortCompletionStudyCtaVisible`
- `readerSourceQuizStartsScopedSession`
- `readerSourceQuizGenerateOpensControls`
- `sourceOverviewSourceQuizLaunchShared`
- retained `studyQuizGenerationControlsVisible`
- retained `studyHabitGoalProgressCardVisible`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 956 implementation passes focused tests.
- Capture live browser evidence for Reader-led source quiz launch and source overview handoff.
- Run targeted and broad backend/frontend checks, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors after the audit records Stage 957 as the completed gate.
