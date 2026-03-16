# ExecPlan: Stage 102 Post-Stage-101 Benchmark Audit

## Summary
- Audited the fresh post-Stage-101 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 101 materially improved Home, but not enough to remove Home as the clearest remaining blocker.
- Selected one more bounded Home implementation pass from fresh visual evidence instead of switching back to Study too early.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Fresh Artifacts
- `scripts/playwright/stage102_post_stage101_benchmark_audit_edge.mjs`
- `output/playwright/stage102-home-landing-desktop.png`
- `output/playwright/stage102-graph-browse-desktop.png`
- `output/playwright/stage102-study-browse-desktop.png`
- `output/playwright/stage102-focused-study-desktop.png`
- `output/playwright/stage102-post-stage101-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 101 materially improved Home.
  - The old standing left support dock is gone, and the first featured reopen flow begins sooner than it did before Stage 101.
  - Home still remains the clearest blocker because the upper landing setup still reads as two staged zones instead of one brisk reopen flow.
  - The isolated `Home` heading and summary on the left, plus the separate search/add utility block on the right, still create too much empty upper canvas before `Start here`.
  - Inference from the user-provided Home benchmark screenshots plus the benchmark matrix: the next bounded pass should collapse the landing header and demote the inline search/add treatment so the first reopen point feels more immediate and selective.
- Study:
  - Study stayed stable after the Home pass and is now materially closer to the benchmark than Home.
  - The browse-mode review flow still carries some shell chrome, but it no longer outranks Home as the next correction.
- Graph:
  - Graph stayed visually stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 102 is complete.
- Stage 103 should be `Recall Home Landing Header Collapse And Inline Search Demotion`.
- Stage 103 should stay tightly bounded to Home: collapse the remaining landing header setup, demote the inline search/add block, and keep Study, Graph, focused Study, and the deferred responsive shell issue stable unless the Home pass naturally improves them.

## Validation
- `node scripts/playwright/stage102_post_stage101_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
