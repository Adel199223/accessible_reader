# ExecPlan: Stage 48 Post-Stage-47 Benchmark Audit

## Summary
- Audit the live post-Stage-47 Home, Graph, Study, and focused-study surfaces against the Recall benchmark before choosing another implementation slice.
- Use the user-provided Recall screenshots as the primary benchmark set and the official Recall docs/changelog sources only as supporting evidence.
- Decide whether the next bounded correction should return to Home density/selectivity, continue Study with a second chrome-reduction pass, or address another clearly evidenced mismatch.

## Goals
- Confirm whether Stage 47 solved the highest-friction Study mismatch enough that another surface is now more important.
- Compare the refreshed Study surface against:
  - the user-provided Recall review screenshot
  - the official Recall spaced-repetition references
  - the fresh localhost artifacts from Stage 47
- Recheck Home and Graph so the next slice is chosen from evidence rather than momentum.
- Preserve the benchmark-driven workflow and screenshot gate for future UI work.

## Scope
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- fresh screenshot artifacts and one repo-owned Edge audit harness

## Out Of Scope
- new backend work
- route or storage changes
- new Home/Graph/Study implementation changes unless the audit exposes a direct regression that must be corrected immediately
- Reader behavior changes unrelated to benchmark regression checking

## Audit Inputs
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)
- Fresh localhost artifacts from Stage 47 and the new Stage 48 audit run

## Audit Questions
- Study:
  - does the centered review hierarchy now feel close enough to Recall that it is no longer the highest-value next rewrite?
  - is the remaining gap mostly sidebar weight, metadata density, or action hierarchy?
- Home:
  - after the Stage 47 Study pass, does populated Home become the clearest remaining benchmark mismatch again?
- Graph:
  - did the calmer Graph canvas remain stable after the Study rewrite?
- Focused regression:
  - does focused reader-led Study still look and behave like a preserved product-specific strength rather than collateral damage from the benchmark work?

## Validation
- Capture fresh localhost screenshots for:
  - Home landing
  - Graph browse
  - Study browse
  - focused Study
- Update `docs/ux/recall_benchmark_matrix.md` with the fresh artifact paths and mismatch severity changes.
- Keep screenshot review mandatory before deciding the next implementation slice.

## Assumptions
- Stage 47 is a meaningful improvement, but not necessarily the final Study pass.
- The next implementation slice should stay bounded to one clear benchmark mismatch rather than reopening all top-level surfaces at once.
- Home, Study, and the shared shell should continue converging toward Recall-like hierarchy without cloning Recall literally.
