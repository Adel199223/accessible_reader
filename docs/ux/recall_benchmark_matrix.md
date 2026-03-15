# Recall Benchmark Matrix

Reference matrix for benchmark-driven Recall UI work.

## Benchmark Sources

- User-provided Recall screenshots in this thread on 2026-03-15 are the primary benchmark for Library/home, Add Content, Graph, and Study.
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [How can LLMs and Knowledge Graphs help you build a second brain?](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)

## Surface Matrix

| Surface | Benchmark source and URL | Current localhost artifact | Structural target | Visual target | Allowed product-specific differences | Mismatch severity |
| --- | --- | --- | --- | --- | --- | --- |
| Shared shell + Home | User-provided `items` screenshots in this thread, supported by [Recall docs introduction](https://docs.getrecall.ai/docs/introduction) | `output/playwright/stage47-home-landing-desktop.png` | Use a thinner shell with a calmer left rail, a clearer collection zone, and a more selective primary canvas instead of a dense archive grid of equally weighted cards. | Dark neutral shell, restrained borders, more empty space, fewer repeated labels, lighter metadata. | Keep local-first wording and current core sections; do not add cloud/team collections that the product does not support. | Medium |
| Add Content modal | User-provided Add Content screenshot in this thread, supported by [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content) | `output/playwright/stage43-add-content-dialog-desktop.png` | Present one deliberate import modal with grouped source modes and a stronger primary input area instead of a generic form-first dialog. | Cleaner CTA hierarchy, clearer grouping, less utilitarian panel styling. | Keep only the import modes this product actually supports; unsupported Recall tabs such as Wiki or Extension stay out of scope. | Low |
| Knowledge graph | User-provided graph screenshot in this thread, supported by [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview) and [Recall graph blog article](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain) | `output/playwright/stage47-graph-browse-desktop.png` | Make the graph canvas the dominant surface with one settings/filter panel; move validation/detail panels into secondary support instead of the main frame. | Much lighter chrome, fewer boxed metrics, less dashboard framing around node detail. | Keep evidence grounding, validation actions, and local provenance visible somewhere in the flow. | Low |
| Study / review | User-provided spaced-repetition screenshot in this thread, supported by [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition) and [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone) | `output/playwright/stage47-study-browse-desktop.png` | Recenter the page on the review task with a guided flow and simpler queue support, rather than treating review as one panel inside a dashboard. | Cleaner step hierarchy, clearer main action, reduced sidebar weight and card framing. | Keep local FSRS state, source evidence, and Reader reopen actions. | Medium |
| Focused reader-led work regression | Internal product behavior reference only; preserve Stage 34 reader-led focused work even though Recall does not expose an exact equivalent screenshot here. | `output/playwright/stage47-focused-study-desktop.png` | Keep live Reader content as the primary pane while Notes/Graph/Study detail stays secondary. | Align shell and framing with the calmer benchmark direction without losing the reader-led split. | Reader-led focused work stays product-specific and should not be removed to mimic Recall literally. | Low |

## Stage 47 Follow-Up

- Stage 47 captured fresh localhost Home, Graph, Study, and focused-study artifacts after the Study review/start rewrite.
- Study is materially closer to the benchmark now:
  - the main review task is centered and visually dominant
  - the step hierarchy is clearer
  - source evidence and Reader reopen remain secondary support instead of leading the page
- Home still reads denser and more archive-like than the Recall benchmark on populated datasets, so it may now be the stronger remaining top-level mismatch again.
- Graph remained stable and benchmark-aligned enough that it does not currently demand another immediate rewrite.
- Stage 48 should therefore audit the post-Stage-47 surfaces before choosing whether the next bounded slice returns to Home density/selectivity or continues with a lighter second Study pass.
