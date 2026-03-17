# ExecPlan: Stage 154 Post-Stage-153 Benchmark Audit

## Summary
- Audit the fresh post-Stage-153 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether flattening the boxed spotlight and demoting the follow-on restart was enough to stop Home from leading the mismatch list.
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
- Stage 153 materially calmed Home by deflating the boxed `Start here` spotlight and by turning the `Keep going` restart into a quieter in-flow continuation line.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 153 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the spotlight-deflation and follow-on-header-demotion pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage153_home_spotlight_deflation_edge.mjs`
- `scripts/playwright/stage154_post_stage153_benchmark_audit_edge.mjs`
- `output/playwright/stage153-home-landing-desktop.png`
- `output/playwright/stage153-graph-browse-desktop.png`
- `output/playwright/stage153-study-browse-desktop.png`
- `output/playwright/stage153-focused-study-desktop.png`
- `output/playwright/stage153-home-spotlight-deflation-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage154_post_stage153_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage154_post_stage153_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage154_post_stage153_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-153 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 154 audit artifacts match the validated Stage 153 captures, confirming the audit rerun did not introduce visual drift.
- Stage 153 materially improved Home:
  - the boxed `Start here` card now reads flatter and lighter
  - the `Keep going` restart no longer reopens the flow as a separate labeled band
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the opening still reads as a split staged cluster because the nearby support row lives as a distinct right-side column beside the lead item
  - the first reopen flow still feels more composed than continuous because the opening pair is balanced as two panels instead of one flatter list rhythm
- Graph remains lower-priority because the canvas still dominates and the support framing is materially calmer than the remaining Home opening split.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 154 as complete.
- Open Stage 155 as `Recall Home Opening Column Collapse And Support Row Inline Merge`.
- Keep the next implementation slice bounded to collapsing the remaining Home opening split into one calmer reopen flow; do not reopen Graph, Study, Add Content, or focused reader-led work unless a direct regression is discovered.
