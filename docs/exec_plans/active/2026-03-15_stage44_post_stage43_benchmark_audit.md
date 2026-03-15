# ExecPlan: Stage 44 Post-Stage-43 Benchmark Audit

## Summary
- Audit the live post-Stage-43 app against the benchmark matrix and the user-provided Recall screenshots.
- Confirm that Library/home and Add Content are now close enough to stop dominating the roadmap.
- Use the audit to choose the next bounded implementation slice between Graph browse framing and Study review framing.

## Audit Inputs
- User-provided Recall screenshots in this thread for:
  - Library / home
  - Add Content
  - Graph
  - Study / spaced repetition
- Official supporting Recall references already listed in `docs/ux/recall_benchmark_matrix.md`
- Fresh Stage 43 localhost artifacts:
  - `output/playwright/stage43-library-landing-desktop.png`
  - `output/playwright/stage43-library-landing-tablet.png`
  - `output/playwright/stage43-add-content-dialog-desktop.png`
  - `output/playwright/stage43-library-selectivity-validation.json`
- Current Graph / Study artifacts:
  - `output/playwright/stage41-graph-desktop.png`
  - `output/playwright/stage41-study-desktop.png`
  - refresh them only if the audit needs cleaner post-Stage-43 comparison captures

## Focus Areas
- Library / home:
  - verify that the grouped landing is now close enough to the benchmark to drop below the top roadmap priority
  - decide whether any remaining Library mismatch is minor polish or still merits another structural pass
- Add Content:
  - verify that the single-heading dialog and grouped import modes now feel directionally right
  - keep any remaining work bounded to polish, not another modal rewrite
- Graph:
  - decide whether the next implementation slice should push harder toward a graph-dominant canvas with secondary detail support
- Study:
  - decide whether the next implementation slice should make review more centered and task-dominant while reducing rail weight
- Focused reader-led work:
  - confirm the calmer browse surfaces still sit well beside the Stage 34 focused split behavior

## Expected Outcome
- Update `docs/ux/recall_benchmark_matrix.md` with revised post-Stage-43 severity where appropriate.
- Lock one next bounded implementation slice, likely Stage 45, around either Graph or Study.
- Keep backend, route, anchor, storage, export, sync, OCR, TTS, and chat scope closed unless the audit finds a direct regression.

## Validation
- Manual screenshot review against the benchmark matrix
- Refresh Graph / Study localhost captures only if the audit needs clearer evidence
- No code-level validation required unless the audit itself adds or changes screenshot harnesses

## Assumptions
- Stage 43 is substantial enough to evaluate before more surface code changes.
- Library/home and Add Content should not be reopened immediately unless the audit finds a benchmark regression.
- The goal remains Recall-like clarity and hierarchy, not a pixel-perfect clone.
