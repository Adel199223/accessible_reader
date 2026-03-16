# ExecPlan: Stage 110 Post-Stage-109 Benchmark Audit

## Summary
- Audited the fresh post-Stage-109 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 109 materially improved Home, but not enough to remove Home as the clearest remaining blocker.
- Selected a bounded Home follow-up from fresh screenshot evidence instead of assumption.

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
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage110_post_stage109_benchmark_audit_edge.mjs`
- `output/playwright/stage109-home-landing-desktop.png`
- `output/playwright/stage109-graph-browse-desktop.png`
- `output/playwright/stage109-study-browse-desktop.png`
- `output/playwright/stage109-focused-study-desktop.png`
- `output/playwright/stage109-home-spotlight-footprint-reduction-validation.json`
- `output/playwright/stage110-home-landing-desktop.png`
- `output/playwright/stage110-graph-browse-desktop.png`
- `output/playwright/stage110-study-browse-desktop.png`
- `output/playwright/stage110-focused-study-desktop.png`
- `output/playwright/stage110-post-stage109-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 109 materially improved Home.
  - The `Start here` spotlight is calmer, but the opening still reads as a split staged composition: the featured reopen point sits on the left while nearby/support utility still occupies a separate right-side zone.
  - The remaining counts/search/add treatment still creates too much setup canvas before the Home continuation flow feels immediate and selective.
- Study:
  - Study stayed stable after the Home pass and remains materially calmer than the pre-Stage-105 dashboard-style state.
  - Study is not the clearest remaining mismatch in the fresh Stage 110 captures.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 110 is complete.
- Stage 111 should be `Recall Home Opening Stage Unification And Nearby Flow Lift`.
- Stage 111 should stay tightly bounded to Home: reduce the left/right split in the opening stage, lift nearby reopen support closer into the same first-flow rhythm as `Start here`, and demote the remaining setup utility without reopening Study, Graph, or the deferred responsive-shell issue.

## Validation
- `node scripts/playwright/stage110_post_stage109_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
