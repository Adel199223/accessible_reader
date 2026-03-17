# ExecPlan: Stage 144 Post-Stage-143 Benchmark Audit

## Summary
- Audit the fresh post-Stage-143 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether collapsing the remaining Graph support framing and reducing the default detail overlay state was enough to stop Graph from leading the mismatch list.
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
- Stage 143 materially calmed Graph by flattening the remaining quick-pick card treatment and reducing the selected-node detail to a smaller default peek state.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Graph or narrowed further within Graph.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 143 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the support-framing-collapse and detail-peek-default pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage143_graph_support_framing_collapse_edge.mjs`
- `scripts/playwright/stage144_post_stage143_benchmark_audit_edge.mjs`
- `output/playwright/stage143-home-landing-desktop.png`
- `output/playwright/stage143-graph-browse-desktop.png`
- `output/playwright/stage143-study-browse-desktop.png`
- `output/playwright/stage143-focused-study-desktop.png`
- `output/playwright/stage143-graph-support-framing-collapse-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage144_post_stage143_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage144_post_stage143_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage144_post_stage143_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Home:
  - Home now leads the remaining mismatch list after the Stage 143 Graph pass.
  - The landing still reads as one oversized lead band followed by a sparse lower continuation, which leaves too much empty lower canvas compared with the benchmark direction.
  - The main issue is no longer repeated chrome; it is pacing and spatial balance, especially the broad top feature footprint and the thin follow-on continuation below it.
- Graph:
  - Graph is materially closer after Stage 143 and no longer leads the mismatch list.
  - The flatter quick-pick strip and smaller default detail peek reduce the previous three-column dashboard feel.
  - Some support framing remains, but it now reads as a lower-priority follow-up than Home's empty landing balance.
- Study:
  - Study stayed stable and lower priority in the fresh Stage 144 artifact.
  - The browse-mode review card still reads as one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 144 is complete.
- Stage 145 should be `Recall Home Lead Card Deflation And Lower Canvas Continuation Fill`.
- Stage 145 should stay tightly bounded to Home browse mode:
  - reduce the broad top feature-band footprint so the landing feels less like one dominant boxed lead card
  - strengthen the lower continuation rhythm so the page carries the eye downward instead of ending in empty canvas
  - preserve the calmer shared shell, the current Graph/Study/focused-study baselines, and the deferred narrow-width issue

## Exit Criteria
- Fresh post-Stage-143 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
