# ExecPlan: Stage 136 Post-Stage-135 Benchmark Audit

## Summary
- Audit the fresh post-Stage-135 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether slimming the Graph quick-pick rail and shrinking the selected-node overlay footprint was enough to stop Graph from leading the remaining mismatch list.
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
- Stage 135 materially calmed Graph by turning the quick-pick rail into a lighter selector strip and by shrinking the default selected-node overlay while keeping grounded evidence visible.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Graph or narrowed further within Graph.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 135 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the quick-pick-rail-slimming and overlay-footprint-reduction pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage135_graph_quick_pick_rail_slimming_edge.mjs`
- `scripts/playwright/stage136_post_stage135_benchmark_audit_edge.mjs`
- `output/playwright/stage135-home-landing-desktop.png`
- `output/playwright/stage135-graph-browse-desktop.png`
- `output/playwright/stage135-study-browse-desktop.png`
- `output/playwright/stage135-focused-study-desktop.png`
- `output/playwright/stage135-graph-quick-pick-rail-slimming-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage136_post_stage135_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage136_post_stage135_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage136_post_stage135_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Graph:
  - Graph remains the clearest remaining mismatch after Stage 135.
  - The rail no longer reads as an excerpt-heavy card column, but it still opens with a search field, stacked metric chips, a focused-source block, and a long quick-pick list, so the page still feels like one dominant canvas plus a second tall utility column rather than one lighter filter/settings panel beside the graph.
  - The overlay is materially better and no longer the primary blocker; the remaining mismatch is now concentrated in the left utility rail weight and height.
- Home:
  - Home stayed stable and lower priority in the fresh Stage 136 artifact.
  - The calmer unboxed collection landing still reads closer to the benchmark direction than the remaining Graph rail framing.
- Study:
  - Study stayed stable and lower priority in the fresh Stage 136 artifact.
  - The browse-mode review card still reads as one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 136 is complete.
- Stage 137 should be `Recall Graph Utility Metrics Collapse And Quick-Pick Truncation`.
- Stage 137 should stay tightly bounded to Graph browse mode: collapse the left utility metrics and focus note into a smaller glance-level summary, shorten the default quick-pick stack further, preserve the calmer overlay treatment, and keep Home, Study, focused Study, and the deferred narrow-width shell baseline intact.

## Exit Criteria
- Fresh post-Stage-135 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
