# ExecPlan: Stage 40 Benchmark-Driven Recall Surface Audit

## Summary
- Stage 39 improved hierarchy and density, but the app still remained too far from the Recall benchmark in Library, Add Content, Graph, and Study.
- This audit replaced the generic Stage 40 UX refresh with a benchmark-driven review anchored to the user-provided screenshots plus official Recall docs/blog/changelog references.
- The result is a locked direction for the next implementation slice: shared shell first, then surface convergence.

## Audit Inputs
- User-provided Recall screenshots in this thread for:
  - Library / home
  - Add Content
  - Graph
  - Study / spaced repetition
- Official supporting Recall references:
  - `https://docs.getrecall.ai/docs/introduction`
  - `https://docs.getrecall.ai/docs/tutorials/add-content`
  - `https://docs.getrecall.ai/docs/features/knowledge-graph/overview`
  - `https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition`
  - `https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain`
  - `https://www.getrecall.ai/changelog/get-review-reminders-on-iphone`
- Fresh localhost screenshots captured from the current app.

## Findings
- Shared shell:
  - the app still uses heavier chrome, broader card framing, and a wider rail than the Recall benchmark
  - repeated labels and stacked panels make the workspace feel more dashboard-like than Recall
- Library / home:
  - the current full card wall is calmer than before, but it still does not match Recall's clearer rail-plus-collection-plus-canvas structure
  - `Add source` still carries too much visual weight inside the landing instead of behaving like a top-level action first
- Add Content:
  - the current dialog is functional but still reads as a generic import form rather than a deliberate product surface
- Graph:
  - graph detail and support chrome still dominate too much of the page instead of letting the graph canvas lead
- Study:
  - the review task is still framed like a dashboard detail panel rather than the main experience
- Focused reader-led work:
  - Stage 34 behavior remains valuable and should be preserved, but its framing should harmonize with the lighter shared shell

## Artifacts
- Benchmark matrix: `docs/ux/recall_benchmark_matrix.md`
- Fresh localhost captures:
  - `output/playwright/stage40-library-landing-desktop.png`
  - `output/playwright/stage40-library-landing-tablet.png`
  - `output/playwright/stage40-add-source-dialog-desktop.png`
  - `output/playwright/stage40-graph-desktop.png`
  - `output/playwright/stage40-study-desktop.png`
  - `output/playwright/stage40-focused-notes-desktop.png`
  - `output/playwright/stage40-benchmark-audit-validation.json`

## Validation
- `node scripts/playwright/stage40_benchmark_audit_edge.mjs`
- manual review of the captured localhost screenshots against the user-provided Recall screenshots
- manual review of the official supporting Recall docs/blog/changelog sources listed in the benchmark matrix

## Next Slice
- Open Stage 41 `Recall Shared Shell And Surface Convergence`.
- Scope Stage 41 to shared shell structure, Library/home framing, Add Content modal hierarchy, Graph framing, Study framing, and the visual integration of reader-led focused work.
