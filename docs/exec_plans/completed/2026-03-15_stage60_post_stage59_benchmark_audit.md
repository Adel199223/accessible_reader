# ExecPlan: Stage 60 Post-Stage-59 Benchmark Audit

## Summary
- Audited fresh post-Stage-59 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 59 materially improved Study, but that Study is still the clearest remaining benchmark mismatch.
- Confirmed that Home and Graph stayed stable while focused Study preserved the reader-led split.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage60-home-landing-desktop.png`
- `output/playwright/stage60-graph-browse-desktop.png`
- `output/playwright/stage60-study-browse-desktop.png`
- `output/playwright/stage60-focused-study-desktop.png`
- `output/playwright/stage60-benchmark-audit-validation.json`

## Findings
- Home:
  - the calmer selective landing still holds
  - Home remains a medium-mismatch polish surface rather than the next structural blocker
- Graph:
  - the graph canvas still dominates browse mode appropriately
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - Stage 59 materially improved the first-glance hierarchy; the lower support stack is calmer and the pre-reveal review surface now reads more like one quiz session
  - the disabled full-width rating footer is no longer the main blocker, and the evidence support stack is lighter than it was in Stage 58
  - the remaining mismatch now concentrates in two spots:
    - the queue rail still reads as a separate boxed side card rather than as near-background review utility
    - the pre-reveal `Source evidence` area still occupies more vertical space than the Recall benchmark direction wants before the learner reveals the answer
  - inference from the user-provided review screenshots plus Recall's 2024 review UI notes and the 2026 Quiz 2.0 release: the quiz action should keep first ownership, with supporting context stepping back until the learner needs it
  - Study is still the highest-value next bounded implementation target
- Focused regression:
  - focused Study still preserves the reader-led split with live Reader content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 60 is complete.
- Stage 61 should be `Recall Study Pre-Reveal Evidence Minimization And Queue Rail Softening`.
- Stage 61 should minimize the browse-mode evidence footprint before reveal and further soften the queue rail framing while preserving source grounding, Reader reopen, local FSRS state, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage60_post_stage59_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall references, and the official Recall release notes above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
