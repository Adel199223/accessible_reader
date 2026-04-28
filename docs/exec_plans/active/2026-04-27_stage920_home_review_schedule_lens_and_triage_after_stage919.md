# Stage 920 - Home Review Schedule Lens And Triage After Stage 919

## Status

Complete.

## Intent

Make existing Study schedule power discoverable from Home without changing backend contracts. Home should stay source-card-owned while letting the Library filter to sources with due, this-week, upcoming, new, or reviewed Study cards and route active review signals directly into matching source-scoped Questions.

## Scope

- Add frontend-only Home review filter continuity, defaulting to `all`, using the existing Study schedule drilldown values: `due-now`, `due-this-week`, `upcoming`, `new`, and `reviewed`.
- Filter Home source cards, list rows, and Matches by existing local `StudyCardRecord` data.
- Compose the review schedule lens with Home search, sort, view mode, custom collections, and Stage 910 memory filters.
- Keep Personal notes note-owned and keep Home source cards/rows as source-owned objects.
- Keep primary source-card clicks opening Source overview.
- When a review filter is active, make Home review signals open source-scoped Study Questions with the matching schedule drilldown.
- When no review filter is active, keep Home review signals opening the existing source-scoped Study Review handoff.
- Keep backend schema/API, AI, generated Reader outputs, Add Content, Graph, Notebook, import, and local TTS unchanged.

## Evidence Metrics

- `homeReviewScheduleLensVisible`
- `homeReviewScheduleFilterControlsVisible`
- `homeReviewScheduleFilterNarrowsSourceBoard`
- `homeReviewScheduleMatchesComposeWithSearch`
- `homeReviewScheduleComposesWithMemoryFilter`
- `homeReviewScheduleClearable`
- `homeReviewScheduleFilteredSignalOpensSourceScopedQuestions`
- `homeReviewScheduleInactiveSignalOpensSourceScopedReview`
- `homeReviewSchedulePersonalNotesStayNoteOwned`
- retained Stage 918/919 Study schedule drilldown metrics
- retained Stage 916/917 Home review-ready metrics
- retained Stage 910/911 Home memory filter metrics
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- `npm run test -- --run src/App.test.tsx src/lib/appRoute.test.ts -t "Home|Study|review|schedule|memory|Personal notes|defaultRecallWorkspaceContinuityState"`
- `npm run build`
- `uv run pytest tests/test_api.py -k "graph or notes" -q`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage920_home_review_schedule_lens_and_triage_after_stage919.mjs`
- `node --check scripts/playwright/stage921_post_stage920_home_review_schedule_lens_and_triage_audit.mjs`
- cleanup utility dry-run against `http://127.0.0.1:8000` with `matchedCount: 0`
- live Stage 920 and Stage 921 browser evidence against `http://127.0.0.1:8000`
- `git diff --check`

## Evidence

- Implemented frontend-only `homeReviewFilter` continuity on Home with the existing Study schedule drilldown values and default `all`.
- Home source cards, list rows, and Matches now filter by local Study card schedule state while composing with search, sort, view mode, custom collections, and Stage 910 memory filters.
- Home stays source-card-owned: Personal notes remain note-owned, primary source-card clicks still open Source overview, and review/note objects are not mixed into source boards.
- Active Home review filters route review signals into source-scoped Study Questions with the matching schedule drilldown; inactive review signals retain the source-scoped Study Review handoff.
- Added focused App/appRoute coverage for review-filter state, board/Matches filtering, memory-filter composition, clear behavior, Personal notes separation, and source-scoped Questions handoff.
- Added shared Playwright evidence helper plus Stage 920/921 scripts.
- Stage 920 live evidence passed against `http://127.0.0.1:8000`.
- Evidence file: `output/playwright/stage920-home-review-schedule-lens-and-triage-validation.json`
- Confirmed `homeReviewScheduleLensVisible`, `homeReviewScheduleFilterControlsVisible`, `homeReviewScheduleFilterNarrowsSourceBoard`, `homeReviewScheduleMatchesComposeWithSearch`, `homeReviewScheduleComposesWithMemoryFilter`, `homeReviewScheduleClearable`, `homeReviewScheduleFilteredSignalOpensSourceScopedQuestions`, `homeReviewScheduleInactiveSignalOpensSourceScopedReview`, `homeReviewSchedulePersonalNotesStayNoteOwned`, `homeReviewScheduleSignalsDoNotMixBoardItems`, `stageHarnessCreatedNotesCleanedUp`, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
- Retained Stage 918/919 Study schedule drilldown, Home review-ready, Source review, Home memory-filter, backend graph/notes, generated Reader output, and cleanup-hygiene regression gates.
