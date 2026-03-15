# ExecPlan: Stage 48 Post-Stage-47 Benchmark Audit

## Summary
- Audited fresh post-Stage-47 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the user-provided Recall references already locked into this repo.
- Confirmed that Stage 47 materially reduced the Study mismatch enough that Study is no longer the top roadmap blocker.
- Confirmed that Home is once again the clearest remaining benchmark gap, while Graph stays stable and focused Study keeps the reader-led split intact.

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
- `output/playwright/stage48-home-landing-desktop.png`
- `output/playwright/stage48-graph-browse-desktop.png`
- `output/playwright/stage48-study-browse-desktop.png`
- `output/playwright/stage48-focused-study-desktop.png`
- `output/playwright/stage48-benchmark-audit-validation.json`

## Findings
- Home:
  - the populated landing still reads like a long archive ledger, with one dominant support rail and a dense vertical reopen list
  - the benchmark remains more selective and calmer, with clearer emphasis on the few items that matter now
  - Home is again the highest-value next bounded rewrite
- Graph:
  - the graph canvas still dominates browse mode
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - the centered review frame is materially closer to the Recall benchmark than it was before Stage 47
  - the remaining mismatch is mostly supporting queue/sidebar weight and metadata polish, not a structural miss large enough to outrank Home
- Focused regression:
  - focused Study still preserves the reader-led split with live source content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 48 is complete.
- Stage 49 should be `Recall Home Selective Landing Second Pass`.
- Stage 49 should reduce populated Home density and archive-like repetition while preserving the current shell, Add Content flow, Graph/Study gains, and intentional source entry.

## Validation
- `node scripts/playwright/stage48_post_stage47_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall references

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
