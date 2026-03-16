# ExecPlan: Stage 74 Post-Stage-73 Benchmark Audit

## Summary
- Audited the fresh post-Stage-73 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that the Stage 73 Study pass materially reduced the remaining Study mismatch without regressing Home, Graph, or focused reader-led work.
- Identified Home as the clearest remaining benchmark mismatch again and selected one bounded Home follow-up from fresh evidence.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage74_post_stage73_benchmark_audit_edge.mjs`
- `output/playwright/stage74-home-landing-desktop.png`
- `output/playwright/stage74-graph-browse-desktop.png`
- `output/playwright/stage74-study-browse-desktop.png`
- `output/playwright/stage74-focused-study-desktop.png`
- `output/playwright/stage74-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is once again the clearest remaining benchmark mismatch.
  - The current landing is materially calmer than before, but two gaps still dominate:
    - the left utility rail still reads as a full-height support sidebar rather than a lighter secondary aid
    - the featured reopen row still opens as a broad set of equally weighted cards, so the collection can still read more like a tidy archive wall than like a selective starting surface
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next pass should further demote the utility rail and make the featured reopen surface feel more intentional rather than reopen another Study pass immediately.
- Study:
  - Stage 73 materially improved the Study browse surface.
  - The session rail now reads more like compact utility, and the pre-answer review framing is flatter.
  - Study still has product-specific support chrome, but it is no longer the clearest blocker.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 74 is complete.
- Stage 75 should be `Recall Home Utility Rail Demotion And Featured Reopen Prioritization`.
- Stage 75 should demote the Home utility rail into lighter support and make the featured reopen surface feel more selective and prioritized while preserving grouped browsing, add-source access, search, Study gains, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage74_post_stage73_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
