# ExecPlan: Stage 162 Post-Stage-161 Benchmark Audit

## Summary
- Audit the fresh post-Stage-161 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether demoting the Home lead row and extending the visible continuation was enough to stop Home from leading the mismatch list.
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
- Stage 161 materially calmed Home by pulling the remaining lead row into the shared continuation flow and by making the lower collection carry farther before the reveal control.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 161 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the lead-row-demotion and visible-continuation-extension pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage161_home_lead_row_demotion_edge.mjs`
- `scripts/playwright/stage162_post_stage161_benchmark_audit_edge.mjs`
- `output/playwright/stage161-home-landing-desktop.png`
- `output/playwright/stage161-graph-browse-desktop.png`
- `output/playwright/stage161-study-browse-desktop.png`
- `output/playwright/stage161-focused-study-desktop.png`
- `output/playwright/stage161-home-lead-row-demotion-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage162_post_stage161_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage162_post_stage161_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage162_post_stage161_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-161 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 162 audit artifacts match the validated Stage 161 captures exactly, confirming the audit rerun did not introduce visual drift.
- Stage 161 materially improved Home:
  - the landing no longer stages the first reopen point in a separate spotlight block
  - the shared reopen grid now carries farther down the page before the inline reveal control
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the `Start here` kicker still singles out the first cell more than the benchmark direction wants
  - the `Show all ...` reveal row still reads like a separate endpoint tile instead of a quieter continuation affordance
- Graph remains lower-priority because the canvas still dominates and the remaining selector-strip plus detail-dock framing is calmer than the remaining Home emphasis.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 162 as complete.
- Open Stage 163 as `Recall Home Start Here Kicker Demotion And Reveal Row Deflation`.
- Keep the next implementation slice bounded to softening the remaining `Start here` kicker and reducing the reveal row's separate-endpoint feel; do not reopen Graph, Study, Add Content, or focused reader-led work unless a direct regression is discovered.
