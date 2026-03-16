# ExecPlan: Stage 78 Post-Stage-77 Benchmark Audit

## Summary
- Audited the fresh post-Stage-77 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 77 materially improved Home enough that Home is no longer the clearest blocker.
- Identified Study as the clearest remaining benchmark mismatch again and selected one bounded Study follow-up from fresh evidence.

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
- `scripts/playwright/stage78_post_stage77_benchmark_audit_edge.mjs`
- `output/playwright/stage78-home-landing-desktop.png`
- `output/playwright/stage78-graph-browse-desktop.png`
- `output/playwright/stage78-study-browse-desktop.png`
- `output/playwright/stage78-focused-study-desktop.png`
- `output/playwright/stage78-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 77 materially improved Home.
  - The `Start here` spotlight is shorter and the `Keep nearby` stack is denser, so the landing now reads much more like a selective reopen surface than like a showcase or archive wall.
  - Home still has product-specific density and archive flavor, but it is no longer the clearest remaining blocker.
- Study:
  - Study is once again the clearest remaining benchmark mismatch.
  - Two pressure points now dominate:
    - the browse-mode `Session` dock still reads as a persistent dashboard sidebar rather than as light secondary utility
    - the pre-answer review card still spends too much visual attention on meta framing, especially the `REVIEW ... due ... reviews` row and the top-right `Choose · Reveal · Rate` guidance before the prompt
  - Inference from the user-provided Study benchmark screenshots plus Recall’s current review direction: the next pass should flatten the session dock further and demote pre-answer review meta instead of reopening Home immediately.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 78 is complete.
- Stage 79 should be `Recall Study Session Dock Utility Flattening And Review Meta Demotion`.
- Stage 79 should flatten the browse-mode Study session dock into lighter utility and demote pre-answer review meta so the prompt owns the page sooner while preserving source grounding, Reader reopen, local FSRS state, Home gains, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage78_post_stage77_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
