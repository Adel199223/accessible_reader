# ExecPlan: Stage 152 Post-Stage-151 Benchmark Audit

## Summary
- Audit the fresh post-Stage-151 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether extending the Home continuation grid and demoting the reveal control was enough to stop Home from leading the mismatch list.
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
- Stage 151 materially calmed Home by letting the continuation grid carry farther down the page and by demoting the boxed reveal card into a lighter footer affordance.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 151 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the continuation-grid-fill and reveal-card-demotion pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage151_home_continuation_grid_fill_edge.mjs`
- `scripts/playwright/stage152_post_stage151_benchmark_audit_edge.mjs`
- `output/playwright/stage151-home-landing-desktop.png`
- `output/playwright/stage151-graph-browse-desktop.png`
- `output/playwright/stage151-study-browse-desktop.png`
- `output/playwright/stage151-focused-study-desktop.png`
- `output/playwright/stage151-home-continuation-grid-fill-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage152_post_stage151_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage152_post_stage151_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage152_post_stage151_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-151 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 152 audit artifacts match the validated Stage 151 captures, confirming the audit rerun did not introduce visual drift.
- Stage 151 materially improved Home:
  - the lower continuation now carries farther down the page
  - the reveal no longer reads as a boxed endpoint
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the boxed `Start here` spotlight still stages the opening as a lead card instead of a flatter collection start
  - the nearby support row plus `Keep going` header still restart the flow as separate bands instead of one calmer continuum
- Graph remains lower-priority because the canvas still dominates and the support framing is materially calmer than in the earlier benchmark passes.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 152 as complete.
- Open Stage 153 as `Recall Home Spotlight Deflation And Follow-On Header Demotion`.
- Keep the next implementation slice bounded to flattening the remaining Home opening and continuation framing; do not reopen Graph, Study, Add Content, or focused reader-led work unless a direct regression is discovered.
