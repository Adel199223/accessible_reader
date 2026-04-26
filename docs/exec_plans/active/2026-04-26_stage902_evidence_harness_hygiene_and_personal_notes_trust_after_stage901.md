# Stage 902 - Evidence Harness Hygiene And Personal Notes Trust After Stage 901

## Status

Complete. Live Stage 902 evidence passed on April 26, 2026.

## Intent

Stage 900/901 made source-attached personal notes visible in Home and source workspaces, which also made audit-created notes user-visible. Stage 902 keeps those first-class note surfaces trustworthy by making the Playwright evidence harness self-cleaning and by adding a dry-run cleanup path for existing local audit artifacts.

## Scope

- Track source-note ids created by the shared Notebook/Home/source-memory/promotion evidence helpers.
- Delete tracked harness-created notes after assertions and screenshots complete.
- Report cleanup failures in evidence JSON without masking the original validation failure.
- Add a dry-run cleanup utility that lists source-attached Stage-marker notes and requires `--apply` before deletion.
- Keep product behavior unchanged: Home Personal notes, Source memory, Notebook source context, Reader handoffs, Graph promotion, and Study promotion remain Stage 901 regression surfaces.

## Out Of Scope

- No backend schema/API changes unless a narrow compatibility issue is discovered.
- No global/standalone notes, cloud/import work, AI note generation, block editor work, or generated Reader output changes.
- Do not delete user notes, sentence captures, documents, graph nodes, or study cards from the cleanup utility.

## Evidence Metrics

- `stageHarnessCreatedNotesCleanedUp`
- `stageHarnessCreatedNoteCleanupFailures`
- `personalNotesAuditArtifactsHiddenAfterRun`
- `sourceMemoryAuditArtifactsHiddenAfterRun`
- `cleanupUtilityDryRunListsStageArtifacts`
- `cleanupUtilityApplyDeletesOnlyStageArtifacts`

## Validation Plan

- `npm run test -- --run src/App.test.tsx -t "Home|Notebook|Personal notes|Source overview|Graph|Study"`
- `npm run build`
- `uv run pytest tests/test_api.py -k "graph or notes" -q`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/cleanup_recall_note_audit_artifacts.mjs`
- `node --check scripts/playwright/stage902_evidence_harness_hygiene_and_personal_notes_trust_after_stage901.mjs`
- `node --check scripts/playwright/stage903_post_stage902_evidence_harness_hygiene_and_personal_notes_trust_audit.mjs`
- Run the cleanup utility in dry-run mode and record matched audit artifacts.
- Run Stage 902 live browser evidence after explicit confirmation because the harness will delete only notes it creates during the run.
- `git diff --check`

## Completion Evidence

- Stage 902 live evidence recorded `stageHarnessCreatedNotesCleanedUp: true`, `stageHarnessCreatedNoteCleanupFailures: []`, `stageHarnessCreatedNoteCleanupAttemptedCount: 4`, `stageHarnessCreatedNoteCleanupDeletedCount: 4`, `personalNotesAuditArtifactsHiddenAfterRun: true`, `sourceMemoryAuditArtifactsHiddenAfterRun: true`, `cleanupUtilityDryRunListsStageArtifacts: true`, and `cleanupUtilityApplyDeletesOnlyStageArtifacts: true`.
- The cleanup utility dry-run listed 60 historical source-attached Stage-marker audit notes and did not delete them.
