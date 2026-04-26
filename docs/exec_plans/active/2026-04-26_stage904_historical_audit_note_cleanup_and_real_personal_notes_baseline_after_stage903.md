# Stage 904 - Historical Audit Note Cleanup And Real Personal Notes Baseline After Stage 903

## Status

Complete.

## Intent

Stage 902/903 prevented future audit-created source notes from polluting personal-note surfaces. Stage 904 applies the same guarded matcher to existing local historical audit artifacts so Home Personal notes, Source memory, and note search return to a real personal-note baseline.

## Scope

- Run the cleanup utility dry-run before deletion and record the matched source-attached Stage-marker notes.
- Apply deletion only through the cleanup utility matcher and existing `DELETE /api/recall/notes/{note_id}` endpoint.
- Delete only source-attached Stage-marker note artifacts; do not delete sentence notes, user notes, documents/imports, graph nodes, study cards, or generated Reader outputs.
- Rerun dry-run after apply and require no remaining matched note artifacts.
- Capture Home Personal notes, Source memory, and note-search absence evidence after cleanup.

## Evidence Metrics

- `cleanupUtilityDryRunMatchedBeforeApply`
- `cleanupUtilityApplyDeletedCount`
- `cleanupUtilityApplyFailures`
- `cleanupUtilityDryRunMatchedAfterApply`
- `homePersonalNotesAuditArtifactsAbsent`
- `sourceMemoryAuditArtifactsAbsent`
- `workspaceSearchAuditArtifactsAbsent`

## Evidence Captured

- Before-apply dry-run matched `60` source-attached Stage-marker audit notes and deleted none.
- Stage 904 guarded apply deleted `60` matched notes through the existing note delete endpoint with `cleanupUtilityApplyFailures: []`.
- After-apply dry-run matched `0` notes.
- Live browser evidence recorded `homePersonalNotesAuditArtifactsAbsent: true`, `sourceMemoryAuditArtifactsAbsent: true`, and `workspaceSearchAuditArtifactsAbsent: true`.
- Evidence JSON: `output/playwright/stage904-historical-audit-note-cleanup-and-real-personal-notes-baseline-validation.json`.

## Validation Plan

- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run before apply
- `node scripts/playwright/stage904_historical_audit_note_cleanup_and_real_personal_notes_baseline_after_stage903.mjs`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run after apply
- `node --check scripts/playwright/stage904_historical_audit_note_cleanup_and_real_personal_notes_baseline_after_stage903.mjs`
- targeted frontend/backend validation and `git diff --check`
