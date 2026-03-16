# ExecPlan: Stage 54 Post-Stage-53 Benchmark Audit

## Summary
- Audited fresh post-Stage-53 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked user-provided Recall references.
- Confirmed that Stage 53 materially improved Study, but that Study is still the clearest remaining benchmark mismatch.
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
- `output/playwright/stage54-home-landing-desktop.png`
- `output/playwright/stage54-graph-browse-desktop.png`
- `output/playwright/stage54-study-browse-desktop.png`
- `output/playwright/stage54-focused-study-desktop.png`
- `output/playwright/stage54-benchmark-audit-validation.json`

## Findings
- Home:
  - the calmer selective landing still holds
  - Home remains a medium-mismatch polish surface rather than the next structural blocker
- Graph:
  - the graph canvas still dominates browse mode appropriately
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - the Stage 53 default-collapsed queue materially improved the first-glance hierarchy and fixed the biggest prior blocker
  - the collapsed queue summary still reads as a tall boxed support panel rather than the lighter utility context implied by the benchmark
  - the review-card header still carries enough boxed journey and metadata chrome that the prompt/answer area starts later than the benchmark direction wants
  - Study is still the highest-value next bounded implementation target
- Focused regression:
  - focused Study still preserves the reader-led split with live Reader content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 54 is complete.
- Stage 55 should be `Recall Study Support Rail Flattening And Review Header Compression`.
- Stage 55 should flatten the collapsed browse-mode queue support rail and compress the review-card header chrome while preserving local review state, Reader reopen, source evidence, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage54_post_stage53_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall references

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
