# Stage 932 - Study Memory Progress Timeline After Stage 931

## Status

Complete.

## Intent

Add a Study-first memory-progress timeline that shows how local Study cards move across `new`, `learning`, `practiced`, `confident`, and `mastered` over the selected progress range.

## Scope

- Extend read-only `GET /api/recall/study/progress` with `memory_progress`.
- Derive daily stage snapshots from existing `review_cards` and `review_events`; no schema migration.
- Reuse existing Study progress ranges `14`, `30`, `90`, and `365`, plus existing source scope.
- Add a compact Study dashboard `Memory progress` panel with stacked stage timeline and stage handoffs to Questions.
- Preserve Stage 930 subset filters, Stage 928 review-history filters, schedule drilldowns, question search, filtered Review queue, Home review discovery, Personal notes separation, Reader, Notebook, Graph, Add Content, generated Reader output, AI, notifications, timed questions, bulk management, and schedule/unschedule behavior.

## Evidence Metrics

- `studyMemoryProgressPanelVisible`
- `studyMemoryProgressTimelineVisible`
- `studyMemoryProgressPeriodSwitches`
- `studyMemoryProgressSourceScoped`
- `studyMemoryProgressStageOpensQuestions`
- retained Stage 931 subset metrics
- retained review-history, heatmap, memory-stats, progress, Home review, source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for empty state, all stage buckets, card creation inclusion, event ordering, carry-forward behavior, period ranges, source scope, and no schema mutation.
- Frontend App tests for rendering, range changes, source-scoped progress, stage handoff, filter composition, empty state, and refresh after rating.
- Add `scripts/playwright/stage932_study_memory_progress_timeline_after_stage931.mjs`.
- Add `scripts/playwright/stage933_post_stage932_study_memory_progress_timeline_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 932/933 Playwright, cleanup dry-run, and `git diff --check`.

## Evidence

- Implemented read-only `GET /api/recall/study/progress.memory_progress` with zero-filled daily snapshots for `new`, `learning`, `practiced`, `confident`, and `mastered`, using current card creation timestamps, current card scheduling state, and review-event scheduling snapshots.
- Added the Study `Memory progress` panel with stacked daily stage timeline, latest-day legend counts, 14/30/90/365 range composition through the existing progress-period source of truth, source-scoped focused Study rendering, and stage legend/band handoffs to Questions.
- Added focused frontend and backend coverage for memory-progress rendering, range changes, source scope, stage handoff, card creation inclusion, event ordering, carry-forward, period ranges, and source scope.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "study_progress or study_knowledge" -q'` passed: 3 passed, 64 deselected.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx -t "Study memory progress"'` passed: 1 passed, 123 skipped.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed: 124 passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -q'` passed: 67 passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage932_study_memory_progress_timeline_after_stage931.mjs && node --check scripts/playwright/stage933_post_stage932_study_memory_progress_timeline_audit.mjs'` passed.
- `node scripts/playwright/stage932_study_memory_progress_timeline_after_stage931.mjs --base-url=http://127.0.0.1:8010` passed against a freshly restarted local backend after the older `127.0.0.1:8000` process was found to be serving a stale progress payload.
- Stage 932 evidence recorded `studyMemoryProgressPanelVisible: true`, `studyMemoryProgressTimelineVisible: true`, `studyMemoryProgressPeriodSwitches: true`, `studyMemoryProgressSourceScoped: true`, `studyMemoryProgressStageOpensQuestions: true`, retained subset/review-history/habit/knowledge/progress/Home review/schedule metrics, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8010` dry-run passed with `matchedCount: 0`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed.
