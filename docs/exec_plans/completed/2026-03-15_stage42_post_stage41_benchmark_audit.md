# ExecPlan: Stage 42 Post-Stage-41 Benchmark Audit

## Summary
- Audited the live Stage 41 shell and surface rewrite against the benchmark matrix, the user-provided Recall screenshots, and the fresh Stage 41 localhost captures.
- Locked the next slice from evidence instead of guessing: Library/home remains the highest-leverage benchmark miss on populated datasets.
- Kept the audit benchmark-driven and screenshot-driven without reopening backend, route, anchor, storage, export, sync, OCR, TTS, or chat scope.

## Audit Inputs Used
- User-provided Recall screenshots in this thread for:
  - Library / home
  - Add Content
  - Graph
  - Study / spaced repetition
- Official supporting Recall references already recorded in `docs/ux/recall_benchmark_matrix.md`
- Stage 41 localhost artifacts:
  - `output/playwright/stage41-library-landing-desktop.png`
  - `output/playwright/stage41-library-landing-tablet.png`
  - `output/playwright/stage41-add-content-dialog-desktop.png`
  - `output/playwright/stage41-graph-desktop.png`
  - `output/playwright/stage41-study-desktop.png`
  - `output/playwright/stage41-focused-notes-desktop.png`

## Findings
- Library / home is the highest-value remaining mismatch:
  - the Stage 41 two-zone shell is materially closer to Recall, but the populated canvas still reads as a dense archive grid rather than a more selective, date-aware collection area
  - repeated metadata and the large number of equal-weight cards still make the landing feel busier than the benchmark
- Add Content improved enough that it no longer warrants a standalone slice:
  - grouped import modes are in place
  - the remaining issue is hierarchy polish, mainly the redundant `Add source` / `Add content` framing and support-panel weight
- Graph remains a medium mismatch:
  - calmer than before, but still more node-detail-first than graph-canvas-first
  - not the best immediate next slice while the entry surface still carries the larger benchmark gap
- Study remains a medium mismatch:
  - clearer than before, but still heavier and more queue-rail-first than the benchmark’s centered review flow
- Focused reader-led work remains acceptable:
  - Stage 34 behavior still feels integrated into the calmer shell
  - no audit evidence supports reopening the reader-led split behavior right now

## Decision
- Stage 43 should focus on Library selectivity and add-source hierarchy cleanup.
- Graph and Study should stay queued behind that work, with no shared-shell rewrite reopened in the interim.
- The user-granted permission to delete local test/generated content was not used during this audit because the mismatch remained structural enough to evaluate against the current dataset.

## Validation
- Manual screenshot review against the benchmark matrix and the user-provided Recall screenshots
- No code-level validation required because this slice changed only the audit docs and next-slice decision

## Notes
- The most important remaining issue is no longer overall shell direction; it is benchmark fit on populated surfaces, especially the first Library/home impression.
- Add Content should ride with the next Library slice rather than consuming a separate milestone.
