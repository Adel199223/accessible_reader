# ExecPlan: Stage 62 Post-Stage-61 Benchmark Audit

## Summary
- Audit the fresh post-Stage-61 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirm whether Stage 61 materially reduced the remaining Study mismatch or whether another surface now leads the benchmark gap list.
- Keep screenshot-led review as the selection gate before choosing the next bounded implementation slice.

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

## Goals
- Compare the refreshed Study browse surface against the benchmark now that the queue rail is softer and the pre-reveal evidence footprint is minimized.
- Confirm that Home, Graph, and focused Study remained stable during the Stage 61 pass.
- Use fresh benchmark evidence to choose the Stage 63 bounded follow-up instead of guessing from implementation momentum.

## Scope
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- one repo-owned Edge benchmark-audit harness plus fresh localhost artifacts

## Out Of Scope
- new product code changes unless the audit reveals an obvious blocking regression
- backend or storage changes
- reopening Home or Graph implementation work before the audit is complete

## Evaluation Questions
- Does Study still lead the benchmark mismatch list after the Stage 61 pre-reveal-evidence-minimization and queue-rail-softening pass?
- Does the browse-mode review surface now read more like one compact quiz flow and less like a sidebar-plus-support stack?
- Did Home, Graph, and focused Study stay stable enough that the next slice should remain tightly bounded?

## Validation
- Capture fresh localhost screenshots for Home, Graph, Study, and focused Study.
- Review the artifacts against `docs/ux/recall_benchmark_matrix.md` and the locked Recall references.
- Run the repo-owned Windows Edge screenshot harness for Stage 62.

## Assumptions
- The fresh Stage 61 capture set is sufficient to determine whether Study still deserves the next implementation slice.
- The next highest-value correction should continue to come from benchmark evidence instead of from broad redesign impulse.

## Fresh Artifacts
- `output/playwright/stage62-home-landing-desktop.png`
- `output/playwright/stage62-graph-browse-desktop.png`
- `output/playwright/stage62-study-browse-desktop.png`
- `output/playwright/stage62-focused-study-desktop.png`
- `output/playwright/stage62-benchmark-audit-validation.json`

## Findings
- Home:
  - the calmer selective landing remains intact
  - Home still reads as a medium-mismatch polish surface rather than the next structural blocker
- Graph:
  - the graph canvas still dominates browse mode appropriately
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - Stage 61 held its gains: the queue rail is softer and the pre-reveal evidence area now behaves like compact grounding support instead of a full secondary block
  - the main remaining mismatch is now more session-level than component-level:
    - browse-mode Study still reads like a dashboard page with a persistent queue-summary sidebar rather than a more singular review session
    - the review card still carries extra support chrome before reveal, so the quiz flow does not yet own the page as strongly as the benchmark direction suggests
  - inference from the user-provided review screenshots, Recall docs/discovery language, and Recall's review-reminders and Quiz 2.0 notes: the primary experience should feel like one deliberate question flow, with queue state and support material stepping further into the background until needed
  - Study is still the highest-value next bounded implementation target
- Focused regression:
  - focused Study still preserves the reader-led split with live Reader content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 62 is complete.
- Stage 63 should be `Recall Study Session Singularization And Queue Summary Demotion`.
- Stage 63 should make browse-mode Study feel less like a dashboard page and more like one deliberate review session by demoting the persistent queue summary and trimming extra pre-answer review-card chrome while preserving source grounding, Reader reopen, local FSRS state, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage62_post_stage61_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall references, and the official Recall docs/changelog sources above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
