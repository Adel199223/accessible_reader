# ExecPlan: Stage 52 Post-Stage-51 Benchmark Audit

## Summary
- Audited fresh post-Stage-51 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked user-provided Recall references.
- Confirmed that Stage 51 materially improved Study, but that Study is still the clearest remaining benchmark mismatch.
- Confirmed that Home and Graph stayed stable while focused Study preserved the reader-led split.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)

## Fresh Artifacts
- `output/playwright/stage52-home-landing-desktop.png`
- `output/playwright/stage52-graph-browse-desktop.png`
- `output/playwright/stage52-study-browse-desktop.png`
- `output/playwright/stage52-focused-study-desktop.png`
- `output/playwright/stage52-benchmark-audit-validation.json`

## Findings
- Home:
  - the calmer selective landing from Stage 49 still holds
  - Home remains medium-mismatch polish work rather than the next immediate structural blocker
- Graph:
  - the graph canvas still dominates browse mode appropriately
  - the support rail and overlay remain secondary enough that Graph does not need the next slice
- Study:
  - the Stage 51 rail compression materially helped, but the queue rail still opens by default and still carries multiple tall queue cards that compete with the main review surface
  - the shorter `Recall review` stage shell is directionally better, but it still reads as a second panel ahead of the actual card rather than as lightweight inline guidance
  - Study is still the highest-value next bounded implementation target
- Focused regression:
  - focused Study still preserves the reader-led split with live Reader content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 52 is complete.
- Stage 53 should be `Recall Study Default Queue Collapse And Stage Shell Minimization`.
- Stage 53 should make browse-mode Study land in a summary-first queue state by default and further demote the remaining stage-guide chrome while preserving local review state, Reader reopen, source evidence, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage52_post_stage51_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall references

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
