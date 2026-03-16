# ExecPlan: Stage 86 Post-Stage-85 Benchmark Audit

## Summary
- Audited the fresh post-Stage-85 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 85 materially improved Home enough that Home is no longer the clearest remaining benchmark blocker.
- Identified Study as the clearest remaining mismatch again and selected one bounded Study follow-up from fresh evidence.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage86_post_stage85_benchmark_audit_edge.mjs`
- `output/playwright/stage86-home-landing-desktop.png`
- `output/playwright/stage86-graph-browse-desktop.png`
- `output/playwright/stage86-study-browse-desktop.png`
- `output/playwright/stage86-focused-study-desktop.png`
- `output/playwright/stage86-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 85 materially improved Home.
  - The new same-section `Keep going` continuation fixes the earlier visual dead-end and makes the landing feel more like a continuous selective reopen flow.
  - Home still has smaller remaining polish gaps, but it is no longer the clearest remaining benchmark blocker.
- Study:
  - Study is now the clearest remaining mismatch again.
  - The browse-mode `Session` rail still reads too much like persistent sidebar chrome relative to the benchmark direction.
  - The pre-answer review frame is calmer than before, but the review card still carries more top-and-left framing than the Recall benchmark wants before the prompt and reveal interaction.
  - Inference from the user-provided review screenshots plus the official Recall docs/changelog direction: the next pass should stay bounded to Study and further collapse support chrome so the review task owns the page more completely.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 86 is complete.
- Stage 87 should be `Recall Study Session Dock Minimization And Review Canvas Recentering`.
- Stage 87 should further demote the browse-mode `Session` dock and tighten the pre-answer review framing so the prompt and reveal flow sit more centrally without regressing Home, Graph, or focused reader-led work.

## Validation
- `node scripts/playwright/stage86_post_stage85_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
