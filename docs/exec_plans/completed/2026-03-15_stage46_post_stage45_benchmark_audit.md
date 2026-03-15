# ExecPlan: Stage 46 Post-Stage-45 Benchmark Audit

## Summary
- Audited the live post-Stage-45 Home, Graph, Study, and focused-graph surfaces against the user-provided Recall screenshots plus the official Recall references already locked in the benchmark matrix.
- Confirmed that Graph is no longer the main benchmark problem after Stage 45.
- Confirmed that Study is now the clearest remaining top-level mismatch and should become the next bounded implementation slice.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)

## Fresh Artifacts
- `output/playwright/stage46-home-landing-desktop.png`
- `output/playwright/stage46-graph-browse-desktop.png`
- `output/playwright/stage46-study-browse-desktop.png`
- `output/playwright/stage46-focused-graph-desktop.png`
- `output/playwright/stage46-benchmark-audit-validation.json`

## Findings
- Home:
  - terminology and shell direction are now aligned with the benchmark
  - populated datasets are still denser and more row-heavy than the Recall reference, but the surface is no longer the main roadmap blocker
- Graph:
  - the graph canvas now dominates the page
  - the support rail and detail overlay are secondary enough that Graph is no longer the highest-value next rewrite
- Study:
  - the page still reads like a dashboard with many framed support panels
  - the benchmark direction is more centered and review-task-first, with clearer step hierarchy and less competing chrome
- Focused regression:
  - focused graph/source work still preserves the reader-led split and did not regress during the browse-mode Graph rewrite

## Decision
- Stage 47 should be `Recall Study Centered Review Surface First Pass`.
- Home and Graph should remain stable unless direct regressions appear during Stage 47.

## Validation
- `node scripts/playwright/stage46_post_stage45_benchmark_audit_edge.mjs`
- benchmark matrix and roadmap/assistant-handoff sync
