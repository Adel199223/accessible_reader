# Stage 994 Highlight Review Bulk Triage After Stage 993

## Summary
Open a fresh Stage 994 slice above the completed Stage 992/993 highlight review next-actions checkpoint. Recall's current public direction continues to emphasize saved knowledge, highlights, review, questions, and flexible learning workflows, while this repo keeps general chat, cloud/API/MCP, notifications, local TTS, and generated Reader-output changes out of scope. The highest-leverage compliant next step is to make the local highlight review inbox easier to clear in batches without adding new backend schema or changing FSRS ownership.

Sources: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Recall docs](https://docs.recall.it/).

## Goals
- Add selection controls to Home/custom collection and Source highlight review inbox rows.
- Add bulk actions for selected visible highlights: mark reviewed, dismiss, and restore to unreviewed.
- Keep all actions recoverable and backed by the existing note review-state endpoint.
- Preserve row-level Reader, Notebook, Study, covered-review, uncovered-promotion, and Study Questions handoffs from Stage 992.
- Keep derived Study coverage local and read-only; do not store a separate promoted state.

## Non-Goals
- No backend schema or API expansion.
- No generated Reader output changes.
- No FSRS schedule/rating changes outside existing Study review flows.
- No cloud sync, notifications, shared challenges, local TTS, extension capture, general chat, or AI note generation.
- No destructive note deletion.

## Implementation Plan
1. Inspect the shared highlight review panel renderer and existing review-state update handlers.
2. Add per-surface selection state for the Home and Source inboxes.
3. Render compact row checkboxes plus a bulk-action seam above the visible rows.
4. Route bulk state changes through the existing `PATCH /api/recall/notes/{note_id}/review-state` client helper and refresh the inbox after completion.
5. Clear only acted-on visible selections and keep stale hidden selections from affecting current filter actions.
6. Add focused frontend tests for Home/custom collection and Source bulk triage.
7. Add Stage 994 Playwright evidence for Home and Source bulk select/review/dismiss/restore, row handoff preservation, generated-output freeze, and cleanup dry-run hygiene.

## Validation Plan
- Focused red/green frontend tests for the new bulk-action behavior.
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `node scripts/playwright/stage994_highlight_review_bulk_triage_after_stage993.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Home/custom collection highlight review supports visible-row selection and bulk reviewed/dismissed/restore actions.
- Source overview highlight review supports the same scoped bulk triage.
- Bulk actions do not act on hidden filtered-out rows.
- Existing Stage 992 next-action seam and row-level handoffs remain available.
- Cleanup dry-run reports `matchedCount: 0`.
- Roadmap and assistant handoff docs name Stage 994/995 after validation.

## Implementation Notes
- Added shared per-surface highlight selection state in `frontend/src/components/RecallWorkspace.tsx`.
- Added a compact `Bulk triage` seam to the shared highlight review inbox renderer with selected-visible `Mark selected reviewed`, `Dismiss selected`, and `Restore selected` actions.
- Routed bulk updates through the existing `updateRecallNoteReviewState` API helper and refreshed existing inbox state without adding backend schema or API shape.
- Added focused `App.test.tsx` coverage for Home/custom collection reviewed bulk triage and Source dismiss/restore bulk triage.
- Added `scripts/playwright/stage994_highlight_review_bulk_triage_after_stage993.mjs` with Home and Source browser evidence, Stage 992 next-action preservation, row handoff preservation, generated-output freeze, and cleanup hygiene.
