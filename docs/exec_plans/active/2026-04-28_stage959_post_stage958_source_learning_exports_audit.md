# Stage 959 - Post-Stage-958 Source Learning Exports Audit

## Status

Completed on 2026-04-28.

## Intent

Audit that source learning exports and workspace backup are discoverable, portable, and regression-safe after Stage 958.

## Scope

- Confirm Source overview exposes both plain source export and learning-pack export.
- Confirm Home exposes a compact workspace export surface with manifest counts, warnings, and ZIP download.
- Confirm learning-pack Markdown includes source text/provenance, notes, graph memory, Study questions, progress/session/attempt recap, and excludes soft-deleted Study cards.
- Confirm workspace ZIP retains `manifest.json` and attachments while adding source learning packs under `sources/`.
- Confirm portable manifest counts include `study_answer_attempt` and `study_review_session`.
- Preserve Stage 956/957 Reader-led source quiz launch, Stage 954/955 habit goals, Study generation/attempt/support/session behavior, source memory search, Home review discovery, Reader generated-output freeze, Notebook, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `sourceOverviewPlainExportVisible`
- `sourceOverviewLearningPackExportVisible`
- `homeWorkspaceExportVisible`
- `homeWorkspaceExportCountsVisible`
- `learningPackIncludesNotes`
- `learningPackIncludesGraphMemory`
- `learningPackIncludesStudyQuestions`
- `learningPackIncludesAttemptRecap`
- `workspaceZipIncludesLearningPack`
- `manifestIncludesAttemptAndSessionEntities`
- retained `readerStartSourceQuizStartsSession`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 958 implementation passes focused backend/frontend tests.
- Capture live browser evidence for Source overview and Home export surfaces.
- Fetch learning-pack Markdown and workspace ZIP through the live API to verify contents.
- Run broad backend/frontend checks, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors after Stage 959 is complete.

## Completion Evidence

- Stage 959 Playwright evidence passed with source learning export metrics, Reader-led source quiz launch regression metrics, source/session harness cleanup, and cleanup dry-run `matchedCount: 0`.
- Regression checks retained Study session/attempt behavior, Source overview launch behavior, Home export discovery, and Reader generated-output freeze.
