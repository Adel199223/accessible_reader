# ExecPlan: Stage 50 Post-Stage-49 Benchmark Audit

## Summary
- Audited fresh post-Stage-49 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the user-provided Recall references already locked into this repo.
- Confirmed that Stage 49 materially reduced the Home mismatch enough that Home is no longer the top roadmap blocker.
- Confirmed that Study is once again the clearest remaining benchmark gap, while Graph stays stable and focused Study keeps the reader-led split intact.

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
- `output/playwright/stage50-home-landing-desktop.png`
- `output/playwright/stage50-graph-browse-desktop.png`
- `output/playwright/stage50-study-browse-desktop.png`
- `output/playwright/stage50-focused-study-desktop.png`
- `output/playwright/stage50-benchmark-audit-validation.json`

## Findings
- Home:
  - the landing is materially calmer and more selective than the Stage 48 baseline
  - remaining mismatch is mostly visual/text-density polish rather than another full structural miss
  - Home no longer needs the next immediate implementation slice
- Graph:
  - the graph canvas still dominates browse mode
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - the centered review frame remains directionally correct, but the left queue/support rail still carries too much visual weight
  - the page still reads more like a dashboard with multiple support zones than the simpler review-first Recall benchmark
  - Study is again the highest-value next bounded rewrite
- Focused regression:
  - focused Study still preserves the reader-led split with live source content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 50 is complete.
- Stage 51 should be `Recall Study Sidebar And Queue Compression Second Pass`.
- Stage 51 should reduce browse-mode Study chrome and queue weight while preserving the centered review task, local FSRS state, Reader reopen actions, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage50_post_stage49_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall references

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
