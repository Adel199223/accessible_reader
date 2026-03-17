# ExecPlan: Stage 200 Post-Stage-199 Benchmark Audit

## Summary
- Audit the fresh post-Stage-199 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether lifting the visible Home continuation tail again and pushing the reveal footer lower was enough to stop Home from leading the mismatch list.
- Confirm whether the fresh Graph rerender was only incidental visual noise or evidence of a meaningful benchmark shift before choosing the next bounded implementation slice.

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
- Stage 199 materially calmed Home again by carrying slightly more visible continuation through the landing tail and by pushing the reveal footer lower.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed again within Home or shifted back to another surface.
- The fresh Stage 199 Graph capture rerendered even though manual review showed no material layout drift, so the audit should confirm whether Graph truly remains lower-priority instead of assuming byte stability where it did not occur.

## Goals
- Review fresh Stage 199 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the tail-density-lift and reveal-footer-pushdown pass.
- Decide whether the Stage 199 Graph rerender was incidental or whether a more meaningful drift has re-entered the benchmark picture.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage199_home_tail_density_lift_edge.mjs`
- `scripts/playwright/stage200_post_stage199_benchmark_audit_edge.mjs`
- `output/playwright/stage199-home-landing-desktop.png`
- `output/playwright/stage199-graph-browse-desktop.png`
- `output/playwright/stage199-study-browse-desktop.png`
- `output/playwright/stage199-focused-study-desktop.png`
- `output/playwright/stage199-home-tail-density-lift-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage199_recall_home_tail_density_lift_and_reveal_footer_pushdown.md`
- `docs/exec_plans/completed/2026-03-17_stage200_post_stage199_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage200_post_stage199_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage200_post_stage199_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-199 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 200 reran the fresh Home, Graph, Study, and focused-Study captures after the Stage 199 tail-density-lift and reveal-footer-pushdown pass.
- Home and Graph matched the Stage 199 artifacts exactly, focused Study also stayed byte-stable, and Study rerendered without material visual drift on manual review.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, while Graph, Study, and focused Study stayed lower-priority.
- The next step is a bundled Home landing-endpoint convergence pass rather than a surface shift or another one-delta rewrite.
