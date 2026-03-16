# ExecPlan: Stage 118 Post-Stage-117 Benchmark Audit

## Summary
- Audited the fresh post-Stage-117 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 117 materially improved Home enough that Home is no longer the clearest remaining blocker.
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
- `scripts/playwright/stage118_post_stage117_benchmark_audit_edge.mjs`
- `output/playwright/stage117-home-landing-desktop.png`
- `output/playwright/stage117-graph-browse-desktop.png`
- `output/playwright/stage117-study-browse-desktop.png`
- `output/playwright/stage117-focused-study-desktop.png`
- `output/playwright/stage117-home-lower-canvas-fill-validation.json`
- `output/playwright/stage118-home-landing-desktop.png`
- `output/playwright/stage118-graph-browse-desktop.png`
- `output/playwright/stage118-study-browse-desktop.png`
- `output/playwright/stage118-focused-study-desktop.png`
- `output/playwright/stage118-post-stage117-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 117 materially improved Home.
  - The integrated reveal control now feels part of the same continuation flow instead of a stranded footer action.
  - Home is no longer the clearest remaining blocker in the fresh Stage 118 captures.
- Study:
  - Study stayed stable, but now leads the remaining mismatch list again.
  - The browse-mode `Session` support strip still frames the task more than the Recall direction wants.
  - The review card still sits inside too much empty dashboard canvas before the flow feels immediate.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 118 is complete.
- Stage 119 should be `Recall Study Support Strip Minimization And Review Canvas Tightening`.
- Stage 119 should stay tightly bounded to Study: reduce the remaining support-strip weight, tighten the review-card landing, and keep Home, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage118_post_stage117_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
