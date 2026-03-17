# ExecPlan: Stage 140 Post-Stage-139 Benchmark Audit

## Summary
- Audit the fresh post-Stage-139 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether flattening the remaining Graph selector strip and compacting the quick-pick framing was enough to stop Graph from leading the remaining mismatch list.
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
- Stage 139 materially calmed Graph by flattening the remaining selector strip, turning the glance into an inline summary, and demoting the separate quick-picks header block into a lighter kicker row.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Graph or narrowed further within Graph.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 139 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the selector-strip-flattening and glance-stack-compaction pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage139_graph_selector_strip_flattening_edge.mjs`
- `scripts/playwright/stage140_post_stage139_benchmark_audit_edge.mjs`
- `output/playwright/stage139-home-landing-desktop.png`
- `output/playwright/stage139-graph-browse-desktop.png`
- `output/playwright/stage139-study-browse-desktop.png`
- `output/playwright/stage139-focused-study-desktop.png`
- `output/playwright/stage139-graph-selector-strip-flattening-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage140_post_stage139_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage140_post_stage139_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage140_post_stage139_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Graph:
  - Graph still leads the remaining mismatch list after Stage 139.
  - The flattened selector strip is materially calmer and no longer the main blocker.
  - The remaining weight now sits in duplicated intro framing above the canvas and in the selected-node overlay, which still reads like a tall secondary panel on the right instead of lighter supporting evidence.
- Home:
  - Home stayed stable and lower priority in the fresh Stage 140 artifact.
  - The landing still carries some empty lower canvas, but it reads closer to the benchmark direction than the remaining Graph framing.
- Study:
  - Study stayed stable and lower priority in the fresh Stage 140 artifact.
  - The browse-mode review card still reads as one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 140 is complete.
- Stage 141 should be `Recall Graph Intro Shell Demotion And Detail Overlay Compaction`.
- Stage 141 should stay tightly bounded to Graph browse mode: demote duplicated intro copy/framing around the canvas, compact the selected-node overlay so it behaves more like lightweight supporting evidence, preserve the calmer selector strip, and keep Home, Study, focused Study, and the deferred narrow-width shell baseline intact.

## Exit Criteria
- Fresh post-Stage-139 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
