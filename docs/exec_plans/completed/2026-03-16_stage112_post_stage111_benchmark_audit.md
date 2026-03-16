# ExecPlan: Stage 112 Post-Stage-111 Benchmark Audit

## Summary
- Audited the fresh post-Stage-111 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 111 materially improved Home enough that Home is no longer the clearest remaining blocker.
- Selected a bounded Study follow-up from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage112_post_stage111_benchmark_audit_edge.mjs`
- `output/playwright/stage111-home-landing-desktop.png`
- `output/playwright/stage111-graph-browse-desktop.png`
- `output/playwright/stage111-study-browse-desktop.png`
- `output/playwright/stage111-focused-study-desktop.png`
- `output/playwright/stage111-home-opening-stage-unification-validation.json`
- `output/playwright/stage112-home-landing-desktop.png`
- `output/playwright/stage112-graph-browse-desktop.png`
- `output/playwright/stage112-study-browse-desktop.png`
- `output/playwright/stage112-focused-study-desktop.png`
- `output/playwright/stage112-post-stage111-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 111 materially improved Home.
  - The opening now reads as one calmer first-flow stage, and Home is no longer the clearest remaining mismatch in the fresh Stage 112 captures.
- Study:
  - Study stayed stable after the Home pass, but it now leads the remaining mismatch list again.
  - The browse-mode review still reads like one centered card placed inside a broader dashboard canvas, with the top support strip and surrounding empty space framing the task more than the benchmark direction wants.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 112 is complete.
- Stage 113 should be `Recall Study Support Strip Demotion And Review Card Lift`.
- Stage 113 should stay tightly bounded to Study: demote the remaining browse-mode support strip, pull the review card higher into the canvas, and reduce the lingering dashboard feel without reopening Home, Graph, or the deferred responsive-shell issue.

## Validation
- `node scripts/playwright/stage112_post_stage111_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
