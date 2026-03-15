# ExecPlan: Stage 44 Post-Stage-43 Benchmark Audit

## Summary
- Stage 43 materially improved the Library landing and Add Content hierarchy, so this audit reevaluated the remaining benchmark gaps against the user's Recall screenshots and official Recall references.
- The audit confirmed that Library/home is no longer the main structural mismatch; the bigger remaining gap is Graph browse mode.
- The next implementation slice should rewrite Graph into a graph-dominant canvas and fold in the user-requested `Library` to `Home` terminology cleanup.

## Audit Inputs
- User-provided Recall screenshots in this thread for:
  - Library / home
  - Add Content
  - Graph
  - Study / spaced repetition
- Official supporting Recall references listed in `docs/ux/recall_benchmark_matrix.md`
- Stage 43 localhost artifacts:
  - `output/playwright/stage43-library-landing-desktop.png`
  - `output/playwright/stage43-library-landing-tablet.png`
  - `output/playwright/stage43-add-content-dialog-desktop.png`
  - `output/playwright/stage43-library-selectivity-validation.json`
- Fresh Stage 44 audit captures:
  - `output/playwright/stage44-graph-current-desktop.png`
  - `output/playwright/stage44-study-current-desktop.png`

## Findings
- Library / home:
  - the landing is directionally closer to the benchmark after Stage 43
  - remaining issues are terminology, density, and polish rather than a full structural miss
- Add Content:
  - the dialog hierarchy is now close enough to keep out of the top roadmap slot
  - any remaining work should stay bounded to polish
- Graph:
  - browse mode is still the furthest surface from Recall
  - the current list/detail framing competes with the graph instead of supporting it
  - the next slice should make the graph canvas dominant and demote supporting controls and detail
- Study:
  - still heavier than the benchmark, but closer to the intended task-centric shape than Graph
- Focused reader-led work:
  - Stage 34 behavior remains directionally correct and should stay preserved

## Validation
- Screenshot-led manual review against the benchmark matrix
- Live localhost inspection of `/recall`, Graph, and Study via Playwright

## Outcome
- Stage 45 should target:
  - a graph-canvas-first browse surface
  - calmer supporting controls and node detail framing
  - user-facing `Home` terminology in the shared shell and landing
- Backend, routes, anchors, reader deep links, storage, export, sync, OCR, TTS, and chat all stay out of scope.
