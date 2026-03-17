# ExecPlan: Stage 138 Post-Stage-137 Benchmark Audit

## Summary
- Audit the fresh post-Stage-137 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether collapsing the Graph utility metrics and shortening the default quick-pick stack was enough to stop Graph from leading the remaining mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of assuming another Graph pass.

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
- Stage 137 materially calmed Graph by collapsing the left utility metrics into a glance-level summary and by shortening the default quick-pick stack.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Graph or narrowed further within Graph.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 137 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the utility-metrics-collapse and quick-pick-truncation pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage137_graph_utility_metrics_collapse_edge.mjs`
- `scripts/playwright/stage138_post_stage137_benchmark_audit_edge.mjs`
- `output/playwright/stage137-home-landing-desktop.png`
- `output/playwright/stage137-graph-browse-desktop.png`
- `output/playwright/stage137-study-browse-desktop.png`
- `output/playwright/stage137-focused-study-desktop.png`
- `output/playwright/stage137-graph-utility-metrics-collapse-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage138_post_stage137_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage138_post_stage137_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage138_post_stage137_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Graph:
  - Graph still leads the remaining mismatch list after Stage 137, but more narrowly than before.
  - The selected-node overlay no longer reads like the main blocker; the remaining weight is concentrated in the left selector strip.
  - The search field, glance summary copy, `Quick picks` heading, and four-item pick stack still read as a tall dedicated support column beside the canvas instead of one lighter filter/settings strip.
- Home:
  - Home stayed stable and lower priority in the fresh Stage 138 artifact.
  - The calmer unboxed landing still reads closer to the benchmark direction than the remaining Graph selector-strip framing.
- Study:
  - Study stayed stable and lower priority in the fresh Stage 138 artifact.
  - The browse-mode review surface still reads as one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 138 is complete.
- Stage 139 should be `Recall Graph Selector Strip Flattening And Glance-Stack Compaction`.
- Stage 139 should stay tightly bounded to Graph browse mode: flatten the remaining search/glance/quick-pick stack into one lighter selector strip, keep the graph canvas visually dominant, preserve the calmer overlay treatment, and keep Home, Study, focused Study, and the deferred narrow-width shell baseline intact.

## Exit Criteria
- Fresh post-Stage-137 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
