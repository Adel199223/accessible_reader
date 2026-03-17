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
| Shared shell + Home | User-provided `items` screenshots in this thread, supported by [Recall docs](https://docs.getrecall.ai/) | `output/playwright/stage210-home-landing-desktop.png` | Use a thinner shell with a calmer left rail, a clearer collection zone, and a more selective primary canvas instead of a dense archive grid of equally weighted cards. | Dark neutral shell, restrained borders, more empty space, fewer repeated labels, lighter metadata. | Keep local-first wording and current core sections; do not add cloud/team collections that the product does not support. | Medium |
| Add Content modal | User-provided Add Content screenshot in this thread, supported by [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content) | `output/playwright/stage43-add-content-dialog-desktop.png` | Present one deliberate import modal with grouped source modes and a stronger primary input area instead of a generic form-first dialog. | Cleaner CTA hierarchy, clearer grouping, less utilitarian panel styling. | Keep only the import modes this product actually supports; unsupported Recall tabs such as Wiki or Extension stay out of scope. | Low |
| Knowledge graph | User-provided graph screenshot in this thread, supported by [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview) and [Recall graph blog article](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain) | `output/playwright/stage210-graph-browse-desktop.png` | Make the graph canvas the dominant surface with one settings/filter panel; move validation/detail panels into secondary support instead of the main frame. | Much lighter chrome, fewer boxed metrics, less dashboard framing around node detail. | Keep evidence grounding, validation actions, and local provenance visible somewhere in the flow. | Low |
| Study / review | User-provided spaced-repetition screenshot in this thread, supported by [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition), [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders), and [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges) | `output/playwright/stage210-study-browse-desktop.png` | Recenter the page on the review task with a guided flow and simpler queue support, rather than treating review as one panel inside a dashboard. | Cleaner step hierarchy, clearer main action, reduced sidebar weight and card framing. | Keep local FSRS state, source evidence, and Reader reopen actions. | Low |
| Focused reader-led work regression | Internal product behavior reference only; preserve Stage 34 reader-led focused work even though Recall does not expose an exact equivalent screenshot here. | `output/playwright/stage210-focused-study-desktop.png` | Keep live Reader content as the primary pane while Notes/Graph/Study detail stays secondary. | Align shell and framing with the calmer benchmark direction without losing the reader-led split. | Reader-led focused work stays product-specific and should not be removed to mimic Recall literally. | Low |

## Stage 158 Audit Snapshot

- Stage 158 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 157 lead-row-flattening and footer-reveal-inline-merge pass.
- The rerun matched the validated Stage 157 captures without visual drift.
- Home still leads more narrowly because the top of the landing still reads like a deliberate opening pair and the lower continuation still stays too sparse.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 158 artifacts.

## Stage 159 Implementation Snapshot

- Stage 159 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home opening-pair-equalization and continuation-density-lift pass.
- Home now opens with one lead row and one more visible continuation item before the inline reveal row.
- Graph, Study, and focused Study matched the Stage 158 artifacts byte-for-byte in the fresh Stage 159 capture set.
- Stage 160 should audit whether Home still leads after that calmer opening and fuller visible continuation.

## Stage 160 Audit Snapshot

- Stage 160 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 159 opening-pair-equalization and continuation-density-lift pass.
- The rerun matched the validated Stage 159 captures without visual drift.
- Home still leads more narrowly because the top still reads like a singled-out lead row and the visible continuation still ends too soon.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 160 artifacts.

## Stage 161 Implementation Snapshot

- Stage 161 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home lead-row-demotion and visible-continuation-extension pass.
- Home now starts the merged landing inside the same continuation grid and carries the reopen flow farther before the inline reveal row.
- Graph, Study, and focused Study matched the Stage 160 artifacts byte-for-byte in the fresh Stage 161 capture set.
- Stage 162 should audit whether Home still leads after that calmer shared-grid opening and fuller lower carry.

## Stage 162 Audit Snapshot

- Stage 162 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 161 lead-row-demotion and visible-continuation-extension pass.
- The rerun matched the validated Stage 161 captures without visual drift.
- Home still leads more narrowly because the `Start here` kicker and the `Show all ...` reveal row still bracket the grid too strongly.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 162 artifacts.

## Stage 163 Implementation Snapshot

- Stage 163 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home start-here-kicker-demotion and reveal-row-deflation pass.
- Home now moves the remaining `Start here` cue into quieter inline meta and ends the landing with a flatter footer reveal row.
- Graph, Study, and focused Study matched the Stage 162 artifacts byte-for-byte in the fresh Stage 163 capture set.
- Stage 164 should audit whether Home still leads after that quieter first-row cue and calmer landing endpoint.

## Stage 164 Audit Snapshot

- Stage 164 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 163 start-here-kicker-demotion and reveal-row-deflation pass.
- The rerun matched the validated Stage 163 captures without visual drift.
- Home still leads more narrowly because the first cell still carries an extra lead cue and the footer reveal still splits attention across the lower edge.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 164 artifacts.

## Stage 165 Implementation Snapshot

- Stage 165 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home lead-row-meta-equalization and reveal-footer-utility-merge pass.
- Home now removes the extra visible first-row cue and ends with one calmer continuation-line footer reveal.
- Graph, Study, and focused Study matched the Stage 164 artifacts byte-for-byte in the fresh Stage 165 capture set.
- Stage 166 should audit whether Home still leads after that calmer opening and merged reveal-footer treatment.

## Stage 166 Audit Snapshot

- Stage 166 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 165 lead-row-meta-equalization and reveal-footer-utility-merge pass.
- The rerun matched the validated Stage 165 captures without visual drift.
- Home still leads more narrowly because the landing still ends too soon after the first visible rows and leaves too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 166 artifacts.

## Stage 167 Implementation Snapshot

- Stage 167 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home visible-continuation-extension and lower-canvas-fill pass.
- Home now carries more visible continuation before the reveal row and fills more of the lower canvas.
- Graph, Study, and focused Study matched the Stage 166 artifacts byte-for-byte in the fresh Stage 167 capture set.
- Stage 168 should audit whether Home still leads after that fuller landing carry and lower-canvas fill.

## Stage 168 Audit Snapshot

- Stage 168 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 167 visible-continuation-extension and lower-canvas-fill pass.
- The rerun matched the validated Stage 167 captures without visual drift.
- Home still leads more narrowly because the reveal row still arrives too early and the landing still leaves too much empty lower canvas after the visible continuation.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 168 artifacts.

## Stage 169 Implementation Snapshot

- Stage 169 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home continuation-density-lift and reveal-row-pushdown pass.
- Home now shows slightly more visible continuation before the reveal row and lands that reveal row lower in the landing.
- Graph, Study, and focused Study matched the Stage 168 artifacts byte-for-byte in the fresh Stage 169 capture set.
- Stage 170 should audit whether Home still leads after that denser visible continuation and later reveal row.

## Stage 170 Audit Snapshot

- Stage 170 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 169 continuation-density-lift and reveal-row-pushdown pass.
- The rerun matched the validated Stage 169 captures without visual drift.
- Home still leads more narrowly because the visible continuation still ends too soon and the reveal row still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 170 artifacts.

## Stage 171 Implementation Snapshot

- Stage 171 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home continuation-carry-extension and reveal-row-delay pass.
- Home now carries one more visible reopen item before the reveal row and lands that reveal row lower in the landing.
- Graph, Study, and focused Study matched the Stage 170 artifacts byte-for-byte in the fresh Stage 171 capture set.
- Stage 172 should audit whether Home still leads after that fuller visible continuation and later reveal row.

## Stage 172 Audit Snapshot

- Stage 172 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 171 continuation-carry-extension and reveal-row-delay pass.
- The rerun matched the validated Stage 171 captures without visual drift.
- Home still leads more narrowly because the visible continuation still ends too soon and the reveal row still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 172 artifacts.

## Stage 173 Implementation Snapshot

- Stage 173 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home continuation-tail-extension and reveal-footer-pushdown pass.
- Home now carries one more visible reopen item through the continuation tail before the reveal footer row and lands that footer lower in the landing.
- Graph, Study, and focused Study matched the Stage 172 artifacts byte-for-byte in the fresh Stage 173 capture set.
- Stage 174 should audit whether Home still leads after that fuller visible continuation tail and later reveal footer.

## Stage 174 Audit Snapshot

- Stage 174 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 173 continuation-tail-extension and reveal-footer-pushdown pass.
- The rerun matched the validated Stage 173 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 174 artifacts.

## Stage 175 Implementation Snapshot

- Stage 175 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home continuation-tail-density-lift and reveal-footer-delay pass.
- Home now shows slightly more visible continuation through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 174 artifacts byte-for-byte in the fresh Stage 175 capture set.
- Stage 176 should audit whether Home still leads after that denser visible tail and later reveal footer.

## Stage 176 Audit Snapshot

- Stage 176 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 175 continuation-tail-density-lift and reveal-footer-delay pass.
- The rerun matched the validated Stage 175 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 176 artifacts.

## Stage 177 Implementation Snapshot

- Stage 177 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-carry-extension and reveal-footer-lowering pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 176 artifacts byte-for-byte in the fresh Stage 177 capture set.
- Stage 178 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 178 Audit Snapshot

- Stage 178 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 177 tail-carry-extension and reveal-footer-lowering pass.
- The rerun matched the validated Stage 177 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 178 artifacts.
- Stage 179 should lift the visible Home tail again and push the reveal footer lower without reviving the archive-wall feel.

## Stage 179 Implementation Snapshot

- Stage 179 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-density-lift and reveal-footer-pushdown pass.
- Home now shows slightly more visible continuation through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 178 artifacts byte-for-byte in the fresh Stage 179 capture set.
- Stage 180 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 180 Audit Snapshot

- Stage 180 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 179 tail-density-lift and reveal-footer-pushdown pass.
- The rerun matched the validated Stage 179 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 180 artifacts.
- Stage 181 should carry the visible Home tail farther and delay the reveal footer without reviving the archive-wall feel.

## Stage 181 Implementation Snapshot

- Stage 181 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-carry-extension and reveal-footer-delay pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 180 artifacts byte-for-byte in the fresh Stage 181 capture set.
- Stage 182 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 182 Audit Snapshot

- Stage 182 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 181 tail-carry-extension and reveal-footer-delay pass.
- The rerun matched the validated Stage 181 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 182 artifacts.
- Stage 183 should carry the visible Home tail farther and lower the reveal footer without reviving the archive-wall feel.

## Stage 183 Implementation Snapshot

- Stage 183 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home continuation-tail-extension and reveal-footer-lowering pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 182 artifacts byte-for-byte in the fresh Stage 183 capture set.
- Stage 184 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 184 Audit Snapshot

- Stage 184 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 183 continuation-tail-extension and reveal-footer-lowering pass.
- The rerun matched the validated Stage 183 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 184 artifacts.
- Stage 185 should carry the visible Home tail farther and lower the reveal footer without reviving the archive-wall feel.

## Stage 185 Implementation Snapshot

- Stage 185 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-carry-extension and reveal-footer-lowering pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 184 artifacts byte-for-byte in the fresh Stage 185 capture set.
- Stage 186 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 186 Audit Snapshot

- Stage 186 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 185 tail-carry-extension and reveal-footer-lowering pass.
- The rerun matched the validated Stage 185 captures without visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 186 artifacts.
- Stage 187 should lift the visible Home tail again and push the reveal footer lower without reviving the archive-wall feel.

## Stage 187 Implementation Snapshot

- Stage 187 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-density-lift and reveal-footer-pushdown pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 186 artifacts byte-for-byte in the fresh Stage 187 capture set.
- Stage 188 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 188 Audit Snapshot

- Stage 188 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 187 tail-density-lift and reveal-footer-pushdown pass.
- The rerun matched the validated Stage 187 captures without drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 188 artifacts.
- Stage 189 should carry the visible Home tail farther and delay the reveal footer without reviving the archive-wall feel.

## Stage 189 Implementation Snapshot

- Stage 189 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-carry-extension and reveal-footer-delay pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 188 artifacts byte-for-byte in the fresh Stage 189 capture set.
- Stage 190 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 190 Audit Snapshot

- Stage 190 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 189 tail-carry-extension and reveal-footer-delay pass.
- The rerun matched the validated Stage 189 captures without drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 190 artifacts.
- Stage 191 should lift the visible Home tail again and push the reveal footer lower without reviving the archive-wall feel.

## Stage 191 Implementation Snapshot

- Stage 191 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-density-lift and reveal-footer-pushdown pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 190 artifacts byte-for-byte in the fresh Stage 191 capture set.
- Stage 192 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 192 Audit Snapshot

- Stage 192 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 191 tail-density-lift and reveal-footer-pushdown pass.
- The rerun matched the validated Stage 191 captures without drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 192 artifacts.
- Stage 193 should carry the visible Home tail farther and delay the reveal footer without reviving the archive-wall feel.

## Stage 193 Implementation Snapshot

- Stage 193 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-carry-extension and reveal-footer-delay pass.
- Home now carries one more visible continuation item through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 192 artifacts byte-for-byte in the fresh Stage 193 capture set.
- Stage 194 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 194 Audit Snapshot

- Stage 194 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 193 tail-carry-extension and reveal-footer-delay pass.
- The rerun matched the validated Stage 193 captures without drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 194 artifacts.
- Stage 195 should lift the visible Home tail again and push the reveal footer lower without reviving the archive-wall feel.

## Stage 195 Implementation Snapshot

- Stage 195 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-density-lift and reveal-footer-pushdown pass.
- Home now carries slightly more visible continuation through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 194 artifacts byte-for-byte in the fresh Stage 195 capture set.
- Stage 196 should audit whether Home still leads after that denser visible tail and later reveal footer.

## Stage 196 Audit Snapshot

- Stage 196 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 195 tail-density-lift and reveal-footer-pushdown pass.
- The rerun matched the validated Stage 195 captures without drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 196 artifacts.
- Stage 197 should carry the visible Home tail farther and delay the reveal footer without reviving the archive-wall feel.

## Stage 197 Implementation Snapshot

- Stage 197 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-carry-extension and reveal-footer-delay pass.
- Home now carries the visible continuation farther through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Graph, Study, and focused Study matched the Stage 196 artifacts byte-for-byte in the fresh Stage 197 capture set.
- Stage 198 should audit whether Home still leads after that fuller visible tail and later reveal footer.

## Stage 198 Audit Snapshot

- Stage 198 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 197 tail-carry-extension and reveal-footer-delay pass.
- The rerun matched the validated Stage 197 captures without drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 198 artifacts.
- Stage 199 should lift the visible Home tail again and push the reveal footer lower without reviving the archive-wall feel.

## Stage 199 Implementation Snapshot

- Stage 199 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Home tail-density-lift and reveal-footer-pushdown pass.
- Home now carries slightly more visible continuation through the landing tail before the reveal footer row, and that reveal footer lands lower in the landing.
- Study and focused Study matched the Stage 198 artifacts byte-for-byte, while Graph rerendered without material visual drift on manual review.
- Stage 200 should audit whether Home still leads after that denser visible tail and later reveal footer.

## Stage 200 Audit Snapshot

- Stage 200 refreshed the localhost Home, Study, Graph, and focused-study artifacts after the Stage 199 tail-density-lift and reveal-footer-pushdown pass.
- Home, Graph, and focused Study matched the validated Stage 199 captures exactly, while Study rerendered without material visual drift.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority in the fresh Stage 200 artifacts.
- Stage 201 is complete: the bundled Home landing-endpoint convergence pass carries materially farther through the visible continuation tail before the reveal footer row while keeping the lower tail calm.
- Graph and focused Study matched the Stage 200 captures byte-for-byte, while Study rerendered without material visual drift on visual review.
- Stage 202 is complete: Home and focused Study matched the Stage 201 captures exactly, and Graph plus Study rerendered without material visual drift on visual review.
- Home no longer leads after the bundled landing-endpoint convergence pass.
- Stage 204 is complete: the benchmark audit reran drift-free against Stage 203 and confirmed that Graph still leads because the selector strip and selected-node dock still bracket the canvas like standing support columns.
- Stage 205 is complete: Graph now merges its glance into the selector-strip picker bar, shortens the default quick-pick stack, and uses a smaller inline clue for the default selected-node peek, while Home, Study, and focused Study matched Stage 204 exactly.
- Stage 206 is complete: Home, Study, and focused Study matched Stage 205 exactly, and the Graph rerender showed no material visual drift on review; Graph still leads because the selector strip still reads like a utility column and the default selected-node dock still opens with too much header/meta framing.
- Stage 210 is complete: Home and focused Study matched Stage 209 exactly, Study rerendered without material visual drift, and Graph still leads because the selector strip still reads like a standing utility column while the default detail peek still brackets the canvas.
- Stage 211 should now collapse the remaining selector-strip utility stack and soften the default selected-node peek before the next benchmark audit.
