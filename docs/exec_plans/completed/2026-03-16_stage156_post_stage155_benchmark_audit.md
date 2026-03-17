# ExecPlan: Stage 156 Post-Stage-155 Benchmark Audit

## Summary
- Audit the fresh post-Stage-155 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether collapsing the remaining opening split was enough to stop Home from leading the mismatch list.
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
- Stage 155 materially calmed Home by collapsing the lead-plus-support split and by making the support row read more like part of the same opening flow.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 155 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the opening-column-collapse and support-row-inline-merge pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage155_home_opening_column_collapse_edge.mjs`
- `scripts/playwright/stage156_post_stage155_benchmark_audit_edge.mjs`
- `output/playwright/stage155-home-landing-desktop.png`
- `output/playwright/stage155-graph-browse-desktop.png`
- `output/playwright/stage155-study-browse-desktop.png`
- `output/playwright/stage155-focused-study-desktop.png`
- `output/playwright/stage155-home-opening-column-collapse-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage156_post_stage155_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage156_post_stage155_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage156_post_stage155_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-155 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 156 audit artifacts match the validated Stage 155 captures exactly, confirming the audit rerun did not introduce visual drift.
- Stage 155 materially improved Home:
  - the opening no longer reads as a split lead-plus-support column
  - the nearby support row now behaves more like the next reopen step in the same sequence
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the first reopen point still reads as a singled-out spotlight row instead of a more even reopen flow
  - the lower continuation still ends with too much empty canvas and a separate footer-style reveal endpoint
- Graph remains lower-priority because the canvas still dominates and the remaining selector-strip plus detail-dock framing is calmer than the remaining Home staging.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 156 as complete.
- Open Stage 157 as `Recall Home Lead Row Flattening And Footer Reveal Inline Merge`.
- Keep the next implementation slice bounded to flattening the remaining Home spotlight-row feel and integrating the footer reveal more directly into the continuation flow; do not reopen Graph, Study, Add Content, or focused reader-led work unless a direct regression is discovered.
