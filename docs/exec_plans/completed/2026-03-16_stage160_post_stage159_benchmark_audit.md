# ExecPlan: Stage 160 Post-Stage-159 Benchmark Audit

## Summary
- Audit the fresh post-Stage-159 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether equalizing the Home opening pair and lifting the visible continuation density was enough to stop Home from leading the mismatch list.
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
- Stage 159 materially calmed Home by removing the remaining deliberate opening pair and by pushing one more visible source into the continuation flow before expansion.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 159 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the opening-pair-equalization and continuation-density-lift pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage159_home_opening_pair_equalization_edge.mjs`
- `scripts/playwright/stage160_post_stage159_benchmark_audit_edge.mjs`
- `output/playwright/stage159-home-landing-desktop.png`
- `output/playwright/stage159-graph-browse-desktop.png`
- `output/playwright/stage159-study-browse-desktop.png`
- `output/playwright/stage159-focused-study-desktop.png`
- `output/playwright/stage159-home-opening-pair-equalization-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage160_post_stage159_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage160_post_stage159_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage160_post_stage159_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-159 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 160 audit artifacts match the validated Stage 159 captures exactly, confirming the audit rerun did not introduce visual drift.
- Stage 159 materially improved Home:
  - the landing no longer opens as a deliberate lead-plus-nearby pair
  - one more visible source now carries into the continuation flow before the inline reveal row
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the first reopen point still reads as a singled-out lead row above the collection instead of part of the same reopen rhythm
  - the visible continuation still ends too soon, leaving too much empty lower canvas even after the density lift
- Graph remains lower-priority because the canvas still dominates and the remaining selector-strip plus detail-dock framing is calmer than the remaining Home staging.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 160 as complete.
- Open Stage 161 as `Recall Home Lead Row Demotion And Visible Continuation Extension`.
- Keep the next implementation slice bounded to demoting the remaining singled-out Home lead-row feel and extending the visible continuation before expansion; do not reopen Graph, Study, Add Content, or focused reader-led work unless a direct regression is discovered.
