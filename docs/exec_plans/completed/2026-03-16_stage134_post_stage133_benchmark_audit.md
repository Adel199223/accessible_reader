# ExecPlan: Stage 134 Post-Stage-133 Benchmark Audit

## Summary
- Audit the fresh post-Stage-133 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether collapsing the Graph support rail and compacting the selected-node overlay was enough to stop Graph from leading the remaining mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of continuing to iterate on Graph by assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Graph
  - Home / saved-source landing
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [How can LLMs and Knowledge Graphs help you build a second brain?](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 133 materially calmed Graph by shrinking the left support rail, tightening quick picks, and compacting the selected-node overlay.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Graph or narrowed further within Graph.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 133 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the support-rail-collapse and detail-overlay-compaction pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage133_graph_support_rail_collapse_edge.mjs`
- `scripts/playwright/stage134_post_stage133_benchmark_audit_edge.mjs`
- `output/playwright/stage133-home-landing-desktop.png`
- `output/playwright/stage133-graph-browse-desktop.png`
- `output/playwright/stage133-study-browse-desktop.png`
- `output/playwright/stage133-focused-study-desktop.png`
- `output/playwright/stage133-graph-support-rail-collapse-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage134_post_stage133_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage134_post_stage133_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage134_post_stage133_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Graph:
  - Graph still leads the remaining mismatch list after Stage 133.
  - The rail is materially slimmer, but `Quick picks` still reads as a tall card stack with excerpt-heavy rows, so the left column still competes with the canvas more than the benchmark direction wants.
  - The selected-node overlay is calmer than before, but it still occupies a tall right-edge slice of the stage and continues to feel closer to a nested support panel than light secondary evidence support.
- Home:
  - Home stayed stable and remains lower priority than Graph.
  - The Stage 131 unboxed collection surface still reads calmer than the remaining Graph framing.
- Study:
  - Study stayed stable and remains lower priority than Graph.
  - The browse-mode review surface still reads like one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 134 is complete.
- Stage 135 should be `Recall Graph Quick-Pick Rail Slimming And Overlay Footprint Reduction`.
- Stage 135 should stay tightly bounded to Graph browse mode: slim the quick-pick rail further so it behaves more like a light selector than a second card column, reduce the overlay footprint so the canvas stays dominant, and preserve the calmer Home, Study, focused Study, and deferred narrow-width shell baseline.

## Exit Criteria
- Fresh post-Stage-133 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
