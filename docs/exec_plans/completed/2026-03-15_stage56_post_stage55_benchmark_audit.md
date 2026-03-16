# ExecPlan: Stage 56 Post-Stage-55 Benchmark Audit

## Summary
- Audited fresh post-Stage-55 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked user-provided Recall references.
- Confirmed that Stage 55 materially improved Study, but that Study is still the clearest remaining benchmark mismatch.
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
- `output/playwright/stage56-home-landing-desktop.png`
- `output/playwright/stage56-graph-browse-desktop.png`
- `output/playwright/stage56-study-browse-desktop.png`
- `output/playwright/stage56-focused-study-desktop.png`
- `output/playwright/stage56-benchmark-audit-validation.json`

## Findings
- Home:
  - the calmer selective landing still holds
  - Home remains a medium-mismatch polish surface rather than the next structural blocker
- Graph:
  - the graph canvas still dominates browse mode appropriately
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - the Stage 55 rail flattening and review-header compression materially improved the first-glance hierarchy
  - the collapsed queue rail is lighter now, but it still reads as a boxed side support block rather than as near-background utility
  - the browse-mode top-right `Open in Reader` button plus numbered journey cluster still over-frame the review card and feel heavier than the benchmark direction wants
  - Study is still the highest-value next bounded implementation target
- Focused regression:
  - focused Study still preserves the reader-led split with live Reader content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 56 is complete.
- Stage 57 should be `Recall Study Support Rail Unboxing And Review Utility Demotion`.
- Stage 57 should unbox the collapsed browse-mode support rail and demote the browse-mode Reader/journey utility cluster while preserving local review state, Reader reopen, source evidence, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage56_post_stage55_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall references

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
