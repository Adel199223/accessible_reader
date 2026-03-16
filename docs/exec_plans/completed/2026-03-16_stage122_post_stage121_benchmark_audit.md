# ExecPlan: Stage 122 Post-Stage-121 Benchmark Audit

## Summary
- Audited the fresh post-Stage-121 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 121 materially improved Home enough that Home is no longer the clearest remaining blocker.
- Selected a narrower Study follow-up from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage121_home_opening_spotlight_compaction_edge.mjs`
- `scripts/playwright/stage122_post_stage121_benchmark_audit_edge.mjs`
- `output/playwright/stage121-home-landing-desktop.png`
- `output/playwright/stage121-graph-browse-desktop.png`
- `output/playwright/stage121-study-browse-desktop.png`
- `output/playwright/stage121-focused-study-desktop.png`
- `output/playwright/stage121-home-opening-spotlight-compaction-validation.json`
- `output/playwright/stage122-home-landing-desktop.png`
- `output/playwright/stage122-graph-browse-desktop.png`
- `output/playwright/stage122-study-browse-desktop.png`
- `output/playwright/stage122-focused-study-desktop.png`
- `output/playwright/stage122-post-stage121-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 121 materially improved Home.
  - The opening spotlight is lighter, and the nearby handoff now feels much closer to one continuous selective reopen flow.
  - Home is no longer the clearest remaining blocker in the fresh Stage 122 captures.
- Study:
  - Study stayed stable, but now leads the remaining mismatch list again.
  - The browse-mode support strip still reads like residual dashboard chrome above the task.
  - The review card still sits inside too much empty canvas and does not occupy enough of the page relative to the benchmark direction.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 122 is complete.
- Stage 123 should be `Recall Study Support Strip Collapse And Review Card Expansion`.
- Stage 123 should stay tightly bounded to Study: collapse the remaining top support-strip framing and let the review card occupy more of the browse canvas, while keeping Home, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage122_post_stage121_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
