# Stage 954 - Study Habit Goals After Stage 953

## Status

Completed on 2026-04-28.

## Intent

Add local Study habit goals and review targets so the current quiz-session workbench can show whether today or this week is on track, while preserving FSRS rating semantics and avoiding notifications, shared challenges, cloud sync, and general chat/API work.

## Scope

- Extend existing Study settings with daily/weekly habit goal defaults stored in `app_settings`.
- Extend read-only Study progress with review-event-derived goal status, source-scoped contribution, and compact recent goal-history rows.
- Add compact Habit goal controls to the existing Study Quiz settings surface.
- Add a goal progress card to Study progress and a goal contribution note in the Review filtered recap.
- Preserve Stage 946-953 generation controls, attempts, hints/explanations/timers, difficulty/session settings, seven-type manual cards, schedule/edit/delete flows, Study filters, Source overview memory/review, Home discovery, Reader, Notebook, Graph, Add Content, cleanup hygiene, and FSRS rating semantics.

## Evidence Metrics

- `studyHabitGoalSettingsPersist`
- `studyHabitGoalDailyProgress`
- `studyHabitGoalWeeklyProgress`
- `studyHabitGoalSourceScopedContribution`
- `studyHabitGoalAttemptsDoNotCountUntilRating`
- `studyHabitGoalControlsVisible`
- `studyHabitGoalProgressCardVisible`
- `studyHabitGoalSessionRecapContribution`
- retained `studyQuizSettingsDefaultsPersist`
- retained `studyReviewSessionCompletesWithSummary`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for Study settings habit defaults/persistence/validation, daily and weekly goal status, source-scoped contribution, attempts/timed-out attempts exclusion before rating, and backward-compatible progress fields.
- Frontend App tests for habit controls, goal progress card, source-scoped goal contribution, and session recap contribution after rating.
- Regression checks for Stage 952 quiz settings/session history, Stage 950 support/timers, Stage 948 attempts, Stage 946 generation controls, broad Study/Home/source-memory surfaces, cleanup dry-run, and `git diff --check`.

## Implementation Summary

- Extended `StudySettings` with local habit goal fields for daily/weekly mode, daily review targets, and weekly active-day targets.
- Extended Study progress with `habit_goal`, derived only from filtered `review_events`, including current period status, remaining count, next reset date, and compact recent history.
- Kept attempts, timed-out attempts, and session records out of habit progress until a rating creates a review event.
- Added compact Habit goal controls to Study Quiz settings and a Habit goal progress card to dashboard and source-scoped Study progress.
- Added a Review filtered recap contribution note for rated questions that count toward the current habit target.

## Validation Evidence

- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m compileall app >/tmp/stage954_compile.log && tail -n 20 /tmp/stage954_compile.log'` - passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest tests/test_api.py -k "study_habit_goals_and_review_targets or study_quiz_settings_difficulty_and_sessions" -q'` - 2 passed, 76 deselected.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest tests/test_api.py -q'` - 78 passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'` - passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- -t "Study review progress panel|Study review progress range controls|Study habit goal|Study quiz settings save defaults|Study timed review|Study quiz generation controls"'` - 5 passed, 250 skipped.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` - 148 passed.
