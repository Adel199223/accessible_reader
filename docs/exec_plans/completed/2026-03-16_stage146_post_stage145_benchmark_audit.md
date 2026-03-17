# ExecPlan: Stage 146 Post-Stage-145 Benchmark Audit

## Summary
- Audit the fresh post-Stage-145 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether splitting the Home lead band and integrating the reveal action into the continuation flow was enough to stop Home from leading the mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of assuming Home still needs another immediate pass.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 145 materially calmed Home by deflating the oversized lead band into a split lead-plus-nearby layout and by moving the grouped reveal action into the lower continuation flow.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 145 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the lead-card-deflation and lower-continuation-fill pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage145_home_lead_card_deflation_edge.mjs`
- `scripts/playwright/stage146_post_stage145_benchmark_audit_edge.mjs`
- `output/playwright/stage145-home-landing-desktop.png`
- `output/playwright/stage145-graph-browse-desktop.png`
- `output/playwright/stage145-study-browse-desktop.png`
- `output/playwright/stage145-focused-study-desktop.png`
- `output/playwright/stage145-home-lead-card-deflation-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage146_post_stage145_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage146_post_stage145_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage146_post_stage145_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Home:
  - Stage 145 materially improved Home and it no longer leads the remaining mismatch list.
  - The split lead-plus-nearby opening reads calmer and more selective than the Stage 144 oversized lead band.
  - Some Home mismatch remains, especially the still-large reveal card and the lower grid's remaining open space, but those now read as secondary polish instead of the top-level blocker.
- Graph:
  - Graph now leads the remaining mismatch list again.
  - The left selector strip still reads as a dedicated support sidebar because search, metrics, and quick picks continue to stack as one standing column beside the canvas.
  - The selected-node detail still behaves like a right-side dock rather than a lighter edge peek, so the canvas remains bracketed by support framing on both sides.
- Study:
  - Study stayed stable and lower priority in the fresh Stage 146 artifact.
  - The centered review card still reads closer to the Recall benchmark than the remaining Graph browse framing.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 146 is complete.
- Stage 147 should be `Recall Graph Selector Rail Narrowing And Detail Dock Slimming`.
- Stage 147 should stay tightly bounded to Graph browse mode:
  - narrow and quiet the remaining left selector strip so it reads more like utility beside the canvas
  - reduce the right-side selected-node dock footprint while preserving grounded actions, confirm/reject, and Reader/source handoffs
  - preserve the calmer Home landing, the current Study browse surface, and the focused-study baseline

## Exit Criteria
- Fresh post-Stage-145 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
