# ExecPlan: Stage 164 Post-Stage-163 Benchmark Audit

## Summary
- Audit the fresh post-Stage-163 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether demoting the `Start here` kicker and flattening the reveal row was enough to stop Home from leading the mismatch list.
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
- Stage 163 materially calmed Home by demoting the remaining `Start here` cue into quieter inline meta and by turning the reveal control into a flatter footer row.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home again or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 163 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the kicker-demotion and reveal-row-deflation pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage163_home_start_here_kicker_demotion_edge.mjs`
- `scripts/playwright/stage164_post_stage163_benchmark_audit_edge.mjs`
- `output/playwright/stage163-home-landing-desktop.png`
- `output/playwright/stage163-graph-browse-desktop.png`
- `output/playwright/stage163-study-browse-desktop.png`
- `output/playwright/stage163-focused-study-desktop.png`
- `output/playwright/stage163-home-start-here-kicker-demotion-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage163_recall_home_start_here_kicker_demotion_and_reveal_row_deflation.md`
- `docs/exec_plans/active/2026-03-16_stage164_post_stage163_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage164_post_stage163_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage164_post_stage163_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-163 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 164 audit artifacts match the validated Stage 163 captures exactly, confirming the audit rerun did not introduce visual drift.
- Stage 163 materially improved Home:
  - the first visible reopen point no longer uses a dedicated kicker block above the row
  - the reveal control no longer reads like a separate boxed endpoint tile
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the first cell still reads as a singled-out reopen point because its inline meta includes an extra `Start here` cue while adjacent rows do not
  - the footer reveal still splits attention across the lower edge with a left command and a distant right utility count instead of reading like one calmer continuation line
- Graph remains lower-priority because the canvas still dominates and the current support rail plus detail dock are calmer than the remaining Home framing cues.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 164 as complete.
- Open Stage 165 as `Recall Home Lead Row Meta Equalization And Reveal Footer Utility Merge`.
- Keep the next implementation slice bounded to equalizing the remaining lead-row meta treatment and consolidating the reveal footer utility into one calmer continuation line; do not reopen Graph, Study, Add Content, or focused reader-led work unless a direct regression is discovered.
