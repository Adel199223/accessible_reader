# ExecPlan: Stage 108 Post-Stage-107 Benchmark Audit

## Summary
- Audited the fresh post-Stage-107 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 107 materially improved Home, but not enough to remove Home as the clearest remaining blocker.
- Selected a bounded Home follow-up from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Fresh Artifacts
- `scripts/playwright/stage108_post_stage107_benchmark_audit_edge.mjs`
- `output/playwright/stage107-home-landing-desktop.png`
- `output/playwright/stage107-graph-browse-desktop.png`
- `output/playwright/stage107-study-browse-desktop.png`
- `output/playwright/stage107-focused-study-desktop.png`
- `output/playwright/stage107-home-featured-flow-unification-validation.json`
- `output/playwright/stage108-home-landing-desktop.png`
- `output/playwright/stage108-graph-browse-desktop.png`
- `output/playwright/stage108-study-browse-desktop.png`
- `output/playwright/stage108-focused-study-desktop.png`
- `output/playwright/stage108-post-stage107-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 107 materially improved Home.
  - The lower `Keep going` continuation is no longer the main blocker; it now reads much more like part of the same reopen flow.
  - Home still remains the clearest remaining mismatch, mainly because the `Start here` spotlight still feels too tall and full-width, and the upper-right search/add utility row still stages the landing more than the Recall direction wants.
- Study:
  - Study stayed stable after the Home pass and remains materially calmer than the pre-Stage-105 state.
  - Study is not the clearest remaining mismatch in the fresh Stage 108 captures.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 108 is complete.
- Stage 109 should be `Recall Home Spotlight Footprint Reduction And Utility Header Softening`.
- Stage 109 should stay tightly bounded to Home: reduce the oversized feel of the featured spotlight and soften the upper utility row so the landing starts even more selectively without reopening Study, Graph, or the deferred responsive-shell issue.

## Validation
- `node scripts/playwright/stage108_post_stage107_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
