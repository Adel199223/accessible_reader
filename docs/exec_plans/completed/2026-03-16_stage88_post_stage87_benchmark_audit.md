# ExecPlan: Stage 88 Post-Stage-87 Benchmark Audit

## Summary
- Audited the fresh post-Stage-87 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 87 materially improved Study enough that Study is no longer the clearest remaining benchmark blocker.
- Identified Home as the clearest remaining mismatch again and selected one bounded Home follow-up from fresh evidence.

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
- `scripts/playwright/stage88_post_stage87_benchmark_audit_edge.mjs`
- `output/playwright/stage88-home-landing-desktop.png`
- `output/playwright/stage88-graph-browse-desktop.png`
- `output/playwright/stage88-study-browse-desktop.png`
- `output/playwright/stage88-focused-study-desktop.png`
- `output/playwright/stage88-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is once again the clearest remaining benchmark mismatch.
  - The landing is materially calmer than it was before Stages 85 and 87, but two gaps still dominate:
    - the utility/search side still reads too much like a standing content column instead of quiet secondary support
    - the landing still spends too much vertical space on setup and section framing before the reopen flow begins
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next pass should stay on Home and demote the utility/search rail while tightening the landing header-to-content handoff rather than reopening Study immediately.
- Study:
  - Stage 87 materially improved Study.
  - The collapsed `Session` dock now reads much more like lightweight utility, and the review card begins sooner because the redundant browse-mode framing is gone.
  - Study still has product-specific support chrome, but it is no longer the clearest blocker.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 88 is complete.
- Stage 89 should be `Recall Home Utility Search Rail Demotion And Landing Header Tightening`.
- Stage 89 should further demote the Home utility/search rail and tighten the landing header-to-reopen-flow handoff while preserving the calmer Study surface, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage88_post_stage87_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
