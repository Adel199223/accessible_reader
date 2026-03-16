# ExecPlan: Stage 76 Post-Stage-75 Benchmark Audit

## Summary
- Audited the fresh post-Stage-75 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 75 materially improved Home and removed the utility rail as the main blocker, but that Home still remains the clearest benchmark mismatch.
- Selected one more bounded Home follow-up from fresh evidence instead of reopening Study or broad shell work.

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
- `scripts/playwright/stage76_post_stage75_benchmark_audit_edge.mjs`
- `output/playwright/stage76-home-landing-desktop.png`
- `output/playwright/stage76-graph-browse-desktop.png`
- `output/playwright/stage76-study-browse-desktop.png`
- `output/playwright/stage76-focused-study-desktop.png`
- `output/playwright/stage76-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 75 materially improved Home.
  - The utility rail now reads like lighter secondary support and is no longer the main blocker.
  - Home still remains the clearest mismatch because two issues now dominate:
    - the new `Start here` spotlight is too tall and showcase-like, leaving too much empty card surface before the collection starts to feel quick and selective
    - the `Keep nearby` secondary reopen stack is calmer than before, but still reads too much like a tall boxed column rather than a denser supporting list
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next pass should shrink the spotlight footprint and tighten the secondary reopen rows rather than reopening Study.
- Study:
  - Study stayed stable after the Home pass.
  - The centered review surface still reads materially closer to the benchmark than Home, so Study does not deserve the next bounded slice.
- Graph:
  - Graph stayed stable and lower mismatch.
  - The graph canvas still dominates enough that Graph does not need immediate follow-up.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 76 is complete.
- Stage 77 should be `Recall Home Spotlight Footprint Reduction And Secondary Reopen Compression`.
- Stage 77 should shrink the oversized Home spotlight card and compress the secondary reopen stack while preserving the lighter utility rail, grouped browsing, add-source access, search, Study gains, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage76_post_stage75_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
