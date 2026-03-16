# Recall Benchmark Matrix

Reference matrix for benchmark-driven Recall UI work.

## Benchmark Sources

- User-provided Recall screenshots in this thread on 2026-03-15 are the primary benchmark for Library/home, Add Content, Graph, and Study.
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [How can LLMs and Knowledge Graphs help you build a second brain?](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)

## Surface Matrix

| Surface | Benchmark source and URL | Current localhost artifact | Structural target | Visual target | Allowed product-specific differences | Mismatch severity |
| --- | --- | --- | --- | --- | --- | --- |
| Shared shell + Home | User-provided `items` screenshots in this thread, supported by [Recall docs](https://docs.getrecall.ai/) | `output/playwright/stage109-home-landing-desktop.png` | Use a thinner shell with a calmer left rail, a clearer collection zone, and a more selective primary canvas instead of a dense archive grid of equally weighted cards. | Dark neutral shell, restrained borders, more empty space, fewer repeated labels, lighter metadata. | Keep local-first wording and current core sections; do not add cloud/team collections that the product does not support. | High |
| Add Content modal | User-provided Add Content screenshot in this thread, supported by [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content) | `output/playwright/stage43-add-content-dialog-desktop.png` | Present one deliberate import modal with grouped source modes and a stronger primary input area instead of a generic form-first dialog. | Cleaner CTA hierarchy, clearer grouping, less utilitarian panel styling. | Keep only the import modes this product actually supports; unsupported Recall tabs such as Wiki or Extension stay out of scope. | Low |
| Knowledge graph | User-provided graph screenshot in this thread, supported by [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview) and [Recall graph blog article](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain) | `output/playwright/stage109-graph-browse-desktop.png` | Make the graph canvas the dominant surface with one settings/filter panel; move validation/detail panels into secondary support instead of the main frame. | Much lighter chrome, fewer boxed metrics, less dashboard framing around node detail. | Keep evidence grounding, validation actions, and local provenance visible somewhere in the flow. | Low |
| Study / review | User-provided spaced-repetition screenshot in this thread, supported by [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition), [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders), and [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges) | `output/playwright/stage109-study-browse-desktop.png` | Recenter the page on the review task with a guided flow and simpler queue support, rather than treating review as one panel inside a dashboard. | Cleaner step hierarchy, clearer main action, reduced sidebar weight and card framing. | Keep local FSRS state, source evidence, and Reader reopen actions. | Medium |
| Focused reader-led work regression | Internal product behavior reference only; preserve Stage 34 reader-led focused work even though Recall does not expose an exact equivalent screenshot here. | `output/playwright/stage109-focused-study-desktop.png` | Keep live Reader content as the primary pane while Notes/Graph/Study detail stays secondary. | Align shell and framing with the calmer benchmark direction without losing the reader-led split. | Reader-led focused work stays product-specific and should not be removed to mimic Recall literally. | Low |

## Stage 109 Outcome Snapshot

- Stage 109 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the implementation pass.
- Stage 109 materially improved Home:
  - the `Start here` spotlight now reads as a tighter opening stage instead of a tall full-width slab
  - the Home search/add controls now read as quieter inline support instead of a separate setup row
  - the lighter `Keep going` continuation flow from Stage 107 stayed intact
- Study, Graph, and focused Study stayed stable in the Stage 109 artifacts.
- Stage 110 should determine whether Home still leads the remaining mismatch list or whether another surface now has the stronger remaining gap.
