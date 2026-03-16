# ExecPlan: Stage 94 Post-Stage-93 Benchmark Audit

## Summary
- Audited the fresh post-Stage-93 Home, Graph, Study, and focused-Study captures against the benchmark matrix and locked Recall references.
- Confirmed that Stage 93 materially improved Study enough that Study is no longer the clearest remaining blocker.
- Selected Home as the next bounded implementation target from fresh evidence instead of carrying forward the pre-Stage-93 Study-first diagnosis.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage94_post_stage93_benchmark_audit_edge.mjs`
- `output/playwright/stage94-home-landing-desktop.png`
- `output/playwright/stage94-graph-browse-desktop.png`
- `output/playwright/stage94-study-browse-desktop.png`
- `output/playwright/stage94-focused-study-desktop.png`
- `output/playwright/stage94-post-stage93-benchmark-audit-validation.json`

## Findings
- Home:
  - Home now leads the remaining mismatch list again.
  - The left `Find later` utility/search area still reads too much like a standing sidebar column inside the main canvas.
  - The `Saved sources` intro copy plus action row still stages the landing before the featured reopen flow more than the benchmark direction wants.
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next bounded pass should demote the utility/search column and compress the saved-source intro so the first reopen point feels more immediate.
- Study:
  - Stage 93 materially improved Study.
  - The browse-mode `Session` dock now reads more like quiet utility, and the pre-answer review header no longer over-frames the task as strongly.
  - Study is no longer the clearest remaining blocker after the Stage 94 audit.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - Its current support chrome still exists, but it is not the highest-value next correction.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 94 is complete.
- Stage 95 should be `Recall Home Find Later Column Demotion And Saved Sources Intro Compaction`.
- Stage 95 should stay tightly bounded to Home: demote the left utility/search column, compress the `Saved sources` intro/setup area, and keep Study, Graph, and focused reader-led work stable.

## Validation
- `node scripts/playwright/stage94_post_stage93_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
