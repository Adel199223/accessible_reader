# Stage 934 - Study Question Scheduling Controls After Stage 933

## Status

Complete.

## Intent

Add local Study question schedule/unschedule controls so the Questions tab can manage review eligibility without leaving the existing source-scoped and filtered Study workflow.

## Scope

- Extend Study card status with `unscheduled`.
- Add a local schedule-state endpoint over existing `review_cards.scheduling_state_json`; no schema migration.
- Add compact Schedule / Unschedule actions in Study Questions and active Review.
- Keep `Review filtered` review-eligible only while unscheduled Questions remain browsable/manageable.
- Preserve Stage 932/933 memory progress, Stage 930/931 subset filters, Stage 928/929 review-history filters, schedule drilldowns, Home review discovery, Source overview, Reader, Notebook, Graph, Add Content, generated Reader output, AI, notifications, timed questions, bulk delete, and question editing behavior.

## Evidence Metrics

- `studyQuestionSchedulingRowActionWorks`
- `studyQuestionSchedulingReviewFilteredSkipsUnscheduled`
- `studyQuestionSchedulingActiveActionAdvances`
- `studyQuestionSchedulingHarnessDocumentsDeleted`
- `studyQuestionSchedulingHarnessProgressCleaned`
- retained Stage 933 memory-progress metrics
- retained subset/review-history/habit/progress/Home review/source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for schedule-state endpoint, unscheduled status derivation, 7-day eligibility, source/list serialization, and progress stability.
- Frontend App tests for Questions row actions, active Review action, unscheduled filter composition, filtered Review queue exclusion, source-scoped behavior, and Home review signal refresh.
- Add `scripts/playwright/stage934_study_question_scheduling_controls_after_stage933.mjs`.
- Add `scripts/playwright/stage935_post_stage934_study_question_scheduling_controls_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 934/935 Playwright, cleanup dry-run, and `git diff --check`.

## Evidence

- Backend `POST /api/recall/study/cards/{card_id}/schedule-state` added with existing `scheduling_state_json` storage only.
- Frontend Questions rows and active Review now expose Schedule / Unschedule controls; `Review filtered` queues only `new` / `due` visible cards.
- Validation:
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage934_study_question_scheduling_controls_after_stage933.mjs && node --check scripts/playwright/stage935_post_stage934_study_question_scheduling_controls_audit.mjs'`
  - `node scripts/playwright/stage934_study_question_scheduling_controls_after_stage933.mjs --base-url=http://127.0.0.1:8000`
  - `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run, `matchedCount: 0`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'`
