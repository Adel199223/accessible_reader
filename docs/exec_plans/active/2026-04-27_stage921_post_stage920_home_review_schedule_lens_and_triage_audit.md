# Stage 921 - Post-Stage-920 Home Review Schedule Lens And Triage Audit

## Status

Complete.

## Intent

Audit that Home review schedule filtering makes Study review readiness discoverable from the Library while preserving source-card ownership, Personal notes separation, Stage 910 memory filters, Stage 916 review-ready signals, Stage 918 Study schedule drilldowns, and Stage 919 regression surfaces.

## Scope

- Confirm Home exposes review schedule filter controls using the existing Study drilldown values.
- Confirm review filters narrow source cards, list rows, and Matches using local Study cards.
- Confirm review filters compose with Home search and Stage 910 memory filters.
- Confirm review filter clear behavior restores the source board.
- Confirm Personal notes remain note-owned and are not mixed into source-card boards.
- Confirm active review-filter signals open source-scoped Study Questions with the matching schedule drilldown.
- Confirm inactive review-ready signals continue to open source-scoped Study Review.
- Retain Home memory signals, Source overview memory/search/review, Study dashboard/drilldowns, Reader, Notebook, Graph, Add Content, cleanup dry-run, and generated Reader output regression surfaces.

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

- `node scripts/playwright/stage921_post_stage920_home_review_schedule_lens_and_triage_audit.mjs --base-url=http://127.0.0.1:8000`
- targeted App Vitest, frontend build, backend graph/notes pytest
- `node --check` for shared Notebook/Home harnesses and Stage 920/921 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence

- Stage 921 live audit passed against `http://127.0.0.1:8000`.
- Evidence file: `output/playwright/stage921-post-stage920-home-review-schedule-lens-and-triage-audit-validation.json`
- Confirmed Stage 920 Home review schedule lens controls, source-board narrowing, Matches/search composition, Stage 910 memory-filter composition, clear behavior, inactive Review handoff, active source-scoped Questions handoff, and Personal notes note-ownership.
- Retained Stage 918/919 Study schedule drilldowns, Stage 916/917 Home review-ready signals and Study dashboard/source rows, Stage 914/915 Source review/Questions, Stage 912/913 source-memory search, Stage 910/911 Home memory filters, Stage 908/909 Home source-memory signals, Source overview memory stack, Notebook, Graph, Reader, Study, cleanup hygiene, generated Reader outputs, and `notesSidebarVisible: false`.
- Required metrics passed: `homeReviewScheduleLensVisible`, `homeReviewScheduleFilterControlsVisible`, `homeReviewScheduleFilterNarrowsSourceBoard`, `homeReviewScheduleMatchesComposeWithSearch`, `homeReviewScheduleComposesWithMemoryFilter`, `homeReviewScheduleClearable`, `homeReviewScheduleFilteredSignalOpensSourceScopedQuestions`, `homeReviewScheduleInactiveSignalOpensSourceScopedReview`, `homeReviewSchedulePersonalNotesStayNoteOwned`, `homeReviewScheduleSignalsDoNotMixBoardItems`, `stageHarnessCreatedNotesCleanedUp`, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
