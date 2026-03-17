# ExecPlan: Stage 158 Post-Stage-157 Benchmark Audit

## Summary
- Audit the fresh post-Stage-157 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether flattening the remaining lead row and inline-merging the reveal endpoint was enough to stop Home from leading the mismatch list.
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
- Stage 157 materially calmed Home by flattening the remaining lead-row spotlight feel and by moving the grouped reveal action into the continuation flow.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 157 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the lead-row-flattening and footer-reveal-inline-merge pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage157_home_lead_row_flattening_edge.mjs`
- `scripts/playwright/stage158_post_stage157_benchmark_audit_edge.mjs`
- `output/playwright/stage157-home-landing-desktop.png`
- `output/playwright/stage157-graph-browse-desktop.png`
- `output/playwright/stage157-study-browse-desktop.png`
- `output/playwright/stage157-focused-study-desktop.png`
- `output/playwright/stage157-home-lead-row-flattening-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage158_post_stage157_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage158_post_stage157_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage158_post_stage157_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-157 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
