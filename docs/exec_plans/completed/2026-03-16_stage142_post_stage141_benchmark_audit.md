# ExecPlan: Stage 142 Post-Stage-141 Benchmark Audit

## Summary
- Audit the fresh post-Stage-141 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether demoting the remaining Graph intro shell and compacting the selected-node overlay was enough to stop Graph from leading the mismatch list.
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
- Stage 141 materially calmed Graph by collapsing the duplicated intro framing above the canvas and shrinking the selected-node overlay into a lighter evidence panel.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Graph or narrowed further within Graph.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 141 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the intro-shell-demotion and detail-overlay-compaction pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage141_graph_intro_shell_demotion_edge.mjs`
- `scripts/playwright/stage142_post_stage141_benchmark_audit_edge.mjs`
- `output/playwright/stage141-home-landing-desktop.png`
- `output/playwright/stage141-graph-browse-desktop.png`
- `output/playwright/stage141-study-browse-desktop.png`
- `output/playwright/stage141-focused-study-desktop.png`
- `output/playwright/stage141-graph-intro-shell-demotion-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage142_post_stage141_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage142_post_stage141_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage142_post_stage141_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Graph:
  - Graph still leads the remaining mismatch list after Stage 141, but more narrowly than before.
  - The duplicated intro framing is no longer the main blocker; the top-of-surface note now reads appropriately light.
  - The remaining weight is concentrated in the combined support framing around the canvas: the left selector strip still opens with stacked quick-pick cards and metric text, and the right-side detail overlay still defaults to a fully open evidence panel.
  - Together those two supports still make the browse surface read more like a three-column dashboard than the benchmark direction wants.
- Home:
  - Home stayed stable and lower priority in the fresh Stage 142 artifact.
  - The landing still carries a broad lead card and some empty lower canvas, but it no longer reads like the clearest top-level blocker.
- Study:
  - Study stayed stable and lower priority in the fresh Stage 142 artifact.
  - The browse-mode review card still reads as one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 142 is complete.
- Stage 143 should be `Recall Graph Support Framing Collapse And Detail Peek Default`.
- Stage 143 should stay tightly bounded to Graph browse mode:
  - demote the left selector strip from stacked card-like quick picks toward a flatter utility list
  - reduce the default selected-node overlay to a smaller peek state so the canvas remains primary until the user chooses deeper inspection
  - preserve grounding, confirm/reject controls, Reader/source handoffs, and the stable Home, Study, focused-Study, and deferred narrow-width baselines

## Exit Criteria
- Fresh post-Stage-141 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
