# ExecPlan: Stage 96 Post-Stage-95 Benchmark Audit

## Summary
- Audited the fresh post-Stage-95 Home, Graph, Study, and focused-Study captures against the benchmark matrix and locked Recall references.
- Confirmed that Stage 95 materially improved Home, but not enough to remove Home as the clearest remaining blocker.
- Selected another bounded Home implementation pass from fresh evidence instead of reopening Study prematurely.

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
- `scripts/playwright/stage96_post_stage95_benchmark_audit_edge.mjs`
- `output/playwright/stage96-home-landing-desktop.png`
- `output/playwright/stage96-graph-browse-desktop.png`
- `output/playwright/stage96-study-browse-desktop.png`
- `output/playwright/stage96-focused-study-desktop.png`
- `output/playwright/stage96-post-stage95-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 95 materially improved Home.
  - The left `Find later` utility/search area is calmer, but it still reads as a dedicated standing column rather than as light support.
  - The `Saved sources` heading, `Earlier` chip, and action row still stage the landing before the featured reopen card more than the benchmark direction wants.
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next bounded pass should collapse the remaining utility-column feel and demote the saved-sources header/action chrome so the featured reopen flow starts more immediately.
- Study:
  - Study stayed stable after the Home pass and remains materially calmer than it was before Stage 93.
  - Study is not the clearest remaining blocker after the Stage 96 audit.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - Its current support chrome still exists, but it is not the highest-value next correction.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 96 is complete.
- Stage 97 should be `Recall Home Utility Column Collapse And Saved Sources Header Action Demotion`.
- Stage 97 should stay tightly bounded to Home: further collapse the left utility/search support and demote the saved-sources heading/action chrome while keeping Study, Graph, and focused reader-led work stable.

## Validation
- `node scripts/playwright/stage96_post_stage95_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
