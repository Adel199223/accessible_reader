# Recall Benchmark Matrix

Reference matrix for benchmark-driven Recall UI work.

## Benchmark Sources

- User-provided Recall workspace screenshots in this thread on 2026-03-18 are the primary benchmark for wide-desktop `Home`, `Graph`, `Study`, `Notes`, and `Reader`.
- User-provided Recall screenshots in this thread on 2026-03-15 remain the primary benchmark for the Add Content modal direction.
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [How can LLMs and Knowledge Graphs help you build a second brain?](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain)
  - [Get Review Reminders on iPhone](https://www.getrecall.ai/changelog/get-review-reminders-on-iphone)

## Surface Matrix

| Surface | Benchmark source and URL | Current localhost artifact | Structural target | Visual target | Allowed product-specific differences | Current benchmark role |
| --- | --- | --- | --- | --- | --- | --- |
| Shared shell + Home | User-provided Home screenshot in this thread on 2026-03-18, supported by [Recall docs](https://docs.getrecall.ai/) | `output/playwright/stage367-home-wide-top.png` | Use a thinner shell with a calmer left rail, a stronger collection workspace, and a denser resume/library flow above the fold instead of a header card plus oversized resume card plus sparse archive tail. | Dark neutral shell, restrained borders, more visible working content, fewer repeated labels, lighter metadata, less empty canvas. | Keep local-first wording, current core sections, and the shell-level `Search` / `New` actions. | Regression baseline |
| Add Content modal | User-provided Add Content screenshot in this thread, supported by [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content) | `output/playwright/stage43-add-content-dialog-desktop.png` | Present one deliberate import modal with grouped source modes and a stronger primary input area instead of a generic form-first dialog. | Cleaner CTA hierarchy, clearer grouping, less utilitarian panel styling. | Keep only the import modes this product actually supports; unsupported Recall tabs such as Wiki or Extension stay out of scope. | Low |
| Knowledge graph | User-provided graph screenshot in this thread on 2026-03-18, supported by [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview) and [Recall graph blog article](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain) | `output/playwright/stage367-graph-wide-top.png` | Make the graph canvas the dominant surface with one settings/filter panel and a docked evidence flow instead of the old standing right detail card. | Much lighter chrome, fewer boxed metrics, less dashboard framing around node detail. | Keep evidence grounding, validation actions, and local provenance visible somewhere in the flow. | Regression baseline |
| Study / review | User-provided spaced-repetition screenshot in this thread on 2026-03-18, supported by [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition), [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders), and [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges) | `output/playwright/stage367-study-wide-top.png` | Recenter the page on the review task with a guided flow and simpler queue support, rather than treating review as one panel inside a dashboard. | Cleaner step hierarchy, clearer main action, reduced sidebar weight and card framing. | Keep local FSRS state, source evidence, and Reader reopen actions. | Regression baseline |
| Notes workspace | User-provided Notes screenshot in this thread on 2026-03-18, supported by [Recall docs](https://docs.getrecall.ai/) for shell direction | `output/playwright/stage367-notes-wide-top.png` | Turn Notes into one clearer note workspace with primary browse/detail flow and quieter context support instead of a left rail plus large blank detail plus strong context column. | Calmer detail emphasis, less empty shell framing, fewer competing side cards. | Keep note edit/delete, promotion, search, anchored reopen, and `Open in Reader`. | Regression baseline |
| Reader workspace | User-provided Reader screenshot in this thread on 2026-03-18, supported by [Recall docs](https://docs.getrecall.ai/) for shell direction | `output/playwright/stage367-reader-wide-top.png` | Make document text more dominant, compress the header/control stack, and demote side support into a calmer dock or tray instead of a co-equal right column. | More reading-first space, calmer side chrome, tighter transport/header rhythm. | Preserve `/reader` compatibility, read-aloud, highlighting, note adjacency, and source-library access; do not change generated content behavior yet. | Regression baseline |
| Focused reader-led work regression | Internal product behavior reference only; preserve Stage 34 reader-led focused work even though Recall does not expose an exact equivalent screenshot here. | `output/playwright/stage362-focused-reader-narrow-top.png` | Keep live Reader content as the primary pane while Notes/Graph/Study detail stays secondary. | Align shell and framing with the calmer benchmark direction without losing the reader-led split. | Reader-led focused work stays product-specific and should not be removed to mimic Recall literally. | Regression-only |

## Current Priority Queue And Baseline

- Canonical benchmark URL: `http://127.0.0.1:8000`
- Current wide-desktop baseline set from March 19, 2026 after the Stage 367 audit:
  - `Home`: `output/playwright/stage367-home-wide-top.png`
  - `Graph`: `output/playwright/stage367-graph-wide-top.png`
  - `Notes`: `output/playwright/stage367-notes-wide-top.png`
  - `Reader`: `output/playwright/stage367-reader-wide-top.png`
  - `Study`: `output/playwright/stage367-study-wide-top.png`
  - `Study` answer-shown reference: `output/playwright/stage367-study-answer-shown-wide-top.png`
- The user-priority desktop-first sequence `Graph -> Home -> Reader -> Notes` is complete.
- `Graph`, `Home`, `Reader`, and `Notes` are locked as the desktop regression baselines after the completed Stage 355/356, Stage 357/358, Stage 359/360, and Stage 361/362 milestones.
- The Stage 363/364 baseline consolidation is complete.
- The Stage 366/367 desktop-first `Study` milestone is complete, so `Study` now joins the same locked baseline set.
- There is no automatic next redesign target until the user explicitly unlocks one.

## Stage 362 Notes Milestone Snapshot

- Stage 362 confirmed that the Stage 361 Notes milestone succeeded overall.
- Wide desktop `Notes` now uses a clearer browse/detail workspace with a stronger note stage, denser browsing, and quieter context support instead of the old left rail plus blank detail plus strong context column.
- Focused and narrower `Notes` now inherit that same hierarchy instead of keeping the older disconnected empty/detail language.
- The user-priority desktop-first sequence is now complete, and the next honest step is bounded baseline consolidation across `Home`, `Graph`, `Reader`, and `Notes` while `Study` remains frozen.

## Stage 360 Reader Milestone Snapshot

- Stage 360 confirmed that the Stage 359 Reader milestone succeeded overall.
- Wide desktop `Reader` now uses a stronger text-first reading deck with one calmer control ribbon and a docked source/notes support flow instead of the old co-equal right context column.
- Focused and narrower Reader states now inherit that same hierarchy, so the wide-desktop redesign and the focused regression view no longer drift apart.
- The fixed queue now advances to `Notes`, while `Graph`, `Home`, and `Reader` stay locked as the wide-desktop regression baselines and `Study` remains frozen.

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

## Stage 213 Implementation Snapshot

- Stage 213 refreshed the localhost Home, Graph browse, Study browse, Notes browse/detail, Reader, and focused split-view artifacts after the approved cross-surface UX correction.
- Home now uses one calmer source-row pattern and a tighter inline utility/search frame.
- Graph browse now collapses the selector strip into a lighter utility row and keeps selected-node detail in a smaller default peek state.
- Study, Notes, and Reader now read more coherently at the top level, with tighter chrome, calmer support framing, and clearer hierarchy.

## Stage 214 Audit Snapshot

- Stage 214 refreshed the localhost Home, Graph browse, Study browse, Notes browse/detail, Reader, and focused split-view artifacts after the Stage 213 correction.
- The new capture set confirmed that the top-level shell/Home/Graph/Study/Notes/Reader surfaces are materially calmer and more coherent than the Stage 210 baseline.
- No single top-level browse surface now leads the mismatch list the way Home or Graph did in earlier stages.
- The clearest remaining benchmark mismatch is now focused split-view balance: supporting `Graph`, `Notes`, and `Study` panes still carry more secondary card chrome and pane weight than the benchmark direction wants, which makes the live Reader compete more than it should in focused mode.
- Stage 215 should rebalance those focused split states while preserving the Stage 213 top-level gains and the product-specific Reader-led workflow.

## Stage 215 Implementation Snapshot

- Stage 215 refreshed the localhost focused source-overview, focused `Graph`, focused `Study`, focused `Notes`, and shared Reader artifacts after the focused split-view rebalancing pass.
- The source-focused strip now reads as a calmer context rail instead of a second header block.
- Focused `Graph` and focused `Notes` now keep noticeably lighter support columns, and the shared Reader route retains the calmer Stage 213 chrome.
- Focused `Study` improved, but it still carries the heaviest remaining support-column stack.

## Stage 216 Audit Snapshot

- Stage 216 refreshed the localhost Home, focused source-overview, focused `Graph`, focused `Study`, focused `Notes`, and Reader artifacts after the Stage 215 rebalancing pass.
- The new capture set confirmed that Stage 215 succeeded overall: focused `Graph` and focused `Notes` now leave the embedded Reader clearly primary, and the Stage 213 shell/Home/Reader gains remained stable.
- The clearest remaining benchmark mismatch is now focused `Study`, where the `Active card` support column still reads too much like a co-equal dashboard beside the Reader.
- Stage 217 should deflate that focused `Study` support column while preserving the calmer source strip and Reader-led split behavior.

## Stage 217 Implementation Snapshot

- Stage 217 refreshed the localhost focused source-overview, focused `Graph`, focused `Study`, focused `Notes`, and shared Reader artifacts after the focused `Study` support-column deflation pass.
- Focused `Study` now removes the dashboard-like flow tiles and duplicated summary stack in favor of one calmer metadata glance.
- Focused `Study` evidence now stays anchored to one selected excerpt with shared Reader actions instead of a repeated card stack.
- Focused `Graph`, focused `Notes`, and the shared Reader route matched the calmer Stage 215 balance in the fresh capture set.

## Stage 218 Audit Snapshot

- Stage 218 refreshed the localhost Home, focused source-overview, focused `Graph`, focused `Study`, focused `Notes`, and Reader artifacts after the Stage 217 correction.
- The new capture set confirmed that Stage 217 succeeded overall: focused `Study` no longer reads like a second dashboard beside the Reader, and the Stage 215 focused-split gains remained intact.
- The clearest remaining benchmark mismatch is now `Home`, where the landing still reads too much like a long archive wall of nearly equal reopen rows instead of a more selective collection surface.
- Stage 219 should improve `Home` collection selectivity and reopen hierarchy while preserving the calmer shell and focused-source workflows.

## Stage 219 Implementation Snapshot

- Stage 219 refreshed the localhost Home, expanded-Home, and focused source-overview artifacts after the `Home` collection-selectivity and reopen-hierarchy pass.
- The default `Home` landing now promotes one clearer primary reopen path and a shorter nearby continuation list instead of one flat archive wall of nearly equal rows.
- Resume-first reentry and focused-source handoff stayed intact in the fresh capture set and targeted frontend validation.
- The expanded `Earlier` state still shows the tallest remaining mismatch because the lead reopen card stays oversized beside the reopened archive tail.

## Stage 220 Audit Snapshot

- Stage 220 refreshed the localhost Home, focused source-overview, focused `Graph`, focused `Study`, focused `Notes`, and Reader artifacts after the Stage 219 correction.
- The new capture set confirmed that Stage 219 succeeded overall: the default `Home` landing now reads as a more selective collection surface with a clearer primary reopen path, and the Stage 217 focused `Study`, Stage 215 focused-split, and Stage 213 shell/Reader gains remained intact.
- The remaining highest-leverage mismatch is still localized to `Home`; the paired Stage 219 expanded-Home capture shows that the expanded `Earlier` state still lets the tall lead card and reopened tail recreate a narrow archive-wall feel.
- Stage 221 should rebalance that expanded `Earlier` state while preserving the calmer default landing and focused-source workflows.

## Stage 221 Implementation Snapshot

- Stage 221 refreshed the localhost Home, expanded-Home, and focused source-overview artifacts after the expanded `Earlier` rebalance pass.
- The expanded `Earlier` state now stacks the lead reopen card above the full revealed tail instead of stretching it beside a narrow archive ledger.
- The Stage 219 default landing hierarchy remained intact in the fresh capture set and targeted frontend validation.
- Focused-source entry and the calmer shared shell remained stable while the Home reveal state was corrected.

## Stage 222 Audit Snapshot

- Stage 222 refreshed the localhost Home, expanded Home, focused source-overview, focused `Graph`, focused `Study`, focused `Notes`, and Reader artifacts after the Stage 221 correction.
- The new capture set confirmed that Stage 221 succeeded overall: `Home` now stays calm in both collapsed and expanded states, and the Stage 217 focused `Study`, Stage 215 focused-split, and Stage 213 shell/Reader gains remained intact.
- No new wide-desktop top-level surface clearly leads the benchmark matrix after Stage 222.
- The next highest-leverage issue is the known narrower-width Recall rail/top-grid reflow regression, which now warrants a dedicated follow-up outside the wide-desktop benchmark slice.

## Stage 223 Implementation Snapshot

- Stage 223 refreshed the localhost Home, Graph, focused source-overview, and Reader artifacts at `820x980` after the narrower-width shell correction pass.
- The Recall rail now stays a compact horizontal strip at the targeted breakpoint instead of turning into the earlier wrapped top-grid panel.
- The calmer wide-desktop shell direction and focused-source continuity remained intact in targeted validation and fresh narrower-width captures.
- Stage 224 should audit whether any remaining narrower-width mismatch still meaningfully leads after the shell correction.

## Stage 224 Audit Snapshot

- Stage 224 refreshed the localhost Home, Graph, focused source-overview, and Reader artifacts at `820x980` after the Stage 223 correction.
- The new capture set confirmed that Stage 223 succeeded overall: the narrower-width Recall shell now stays compact, and the focused-source plus Reader workflows remain coherent while the shell compresses.
- The remaining highest-leverage mismatch is now narrower-width Reader chrome weight; the stacked focused-source, view-switching, and read-aloud controls still push active reading lower than the calmer benchmark direction wants.
- Stage 225 should compress the narrower-width Reader chrome while preserving generated-view behavior, source continuity, and note/speech actions.

## Stage 225 Implementation Snapshot

- Stage 225 refreshed the localhost narrower-width Reader captures after the Reader chrome compression pass at `820x980`.
- The Reader source strip, reading-view card, transport row, and reading header now use tighter spacing and smaller narrow-width controls so the text starts higher in the first viewport.
- The transport overflow still exposes voice, rate, and shortcut details without restoring a bulky second row in the default state.
- Stage 226 should audit whether any remaining narrower-width mismatch still meaningfully leads after the Reader chrome compression.

## Stage 226 Audit Snapshot

- Stage 226 refreshed the localhost narrower-width Reader captures, including the default top state, overflow-open state, and full-page continuity view at `820x980`.
- The new capture set confirmed that Stage 225 succeeded overall: the narrower-width Reader text now starts higher beneath the shell, and the read-aloud overflow state remains intact after the compression.
- The remaining highest-leverage mismatch is now the shared focused-source strip at the same breakpoint; its badge/meta/tab stack still occupies more vertical space than the calmer benchmark direction wants before active work begins.
- Stage 227 should compress the shared focused-source strip while preserving source continuity and the Stage 225 Reader gains.

## Stage 227 Implementation Snapshot

- Stage 227 refreshed the localhost narrower-width focused-source captures after the shared strip compression pass at `820x980`.
- The shared focused-source strip now uses a tighter two-column grouping, lighter meta density, and denser tab spacing so the active surface starts sooner beneath the shell.
- A smaller-width fallback now returns that strip to one column below the tighter breakpoint so the narrow compression does not create a new overflow or clipping regression.
- Stage 228 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the strip compression.

## Stage 228 Audit Snapshot

- Stage 228 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 227 succeeded overall: the shared strip now stays calmer above active work, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now the narrower-width focused split beneath that strip; `Notes`, `Graph`, and `Study` still read too evenly three-column beside live reading instead of keeping Reader clearly primary.
- Stage 229 should rebalance the narrower-width focused split while preserving source continuity, shared tab handoffs, and current Reader behavior.

## Stage 229 Implementation Snapshot

- Stage 229 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader captures after the focused split rebalancing pass at `820x980`.
- Focused `Notes`, `Graph`, and `Study` now use a slimmer support rail, a wider Reader column, and a tighter secondary panel so live reading leads more clearly at the narrow breakpoint.
- The shared focused-source strip, shell compactness, and narrow Reader chrome gains remained intact while the split rebalanced.
- Stage 230 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the split rebalance.

## Stage 230 Audit Snapshot

- Stage 230 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 229 succeeded overall: focused `Notes` and `Graph` now read more clearly reader-led, and the broader focused split no longer feels evenly three-column.
- The remaining highest-leverage mismatch is now focused `Study` at the same breakpoint; its queue rail still feels taller and more assertive than the calmer narrow benchmark direction wants beside the Reader and active card.
- Stage 231 should deflate the narrower-width focused `Study` queue rail while preserving source continuity, study behavior, and the Stage 229 split balance.

## Stage 231 Implementation Snapshot

- Stage 231 refreshed the localhost narrower-width focused overview, focused `Study`, queue-open focused `Study`, and Reader captures after the focused `Study` queue-rail deflation pass at `820x980`.
- Focused `Study` now uses a calmer closed rail with shorter utility labels, tighter spacing, softer summary chrome, and less repeated hinting so Reader stays more clearly primary at the narrow breakpoint.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Study` rail deflated.
- Stage 232 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Study` correction.

## Stage 232 Audit Snapshot

- Stage 232 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, queue-open Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 231 succeeded overall: focused `Study` now reads calmer beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Graph` at the same breakpoint; its right `Node detail` panel still feels taller and more assertive than the calmer narrow benchmark direction wants beside the Reader and lighter graph rail.
- Stage 233 should deflate the narrower-width focused `Graph` detail panel while preserving source continuity, graph behavior, and the Stage 229 split balance.

## Stage 233 Implementation Snapshot

- Stage 233 refreshed the localhost narrower-width focused overview, focused `Graph`, full focused `Graph`, and Reader captures after the focused `Graph` detail-panel deflation pass at `820x980`.
- Focused `Graph` now uses shorter node-action labels, tighter toolbar spacing, and a calmer selected-node summary stage so the right detail column starts lighter and Reader stays more clearly primary at the narrow breakpoint.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Graph` detail panel deflated.
- Stage 234 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Graph` correction.

## Stage 234 Audit Snapshot

- Stage 234 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 233 succeeded overall: focused `Graph` now reads calmer beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Study` again at the same breakpoint, but no longer in the left rail; its right `Active card` column still feels taller and more assertive than the calmer narrow benchmark direction wants beside the Reader and lighter queue rail.
- Stage 235 should deflate the narrower-width focused `Study` active-card column while preserving source continuity, study behavior, and the Stage 229 split balance.

## Stage 235 Implementation Snapshot

- Stage 235 refreshed the localhost narrower-width focused overview, focused `Study`, full focused `Study`, queue-open focused `Study`, and Reader captures after the focused `Study` active-card-column deflation pass at `820x980`.
- Focused `Study` now uses a calmer right active-card column with tighter panel spacing, lighter metadata glance chrome, smaller reveal/rating controls, and earlier supporting-evidence entry so Reader stays more clearly primary at the narrow breakpoint.
- The shell compactness, focused split balance, focused `Study` queue-rail gains, and neighboring reader-led focused surfaces remained intact while the focused `Study` active-card column deflated.
- Stage 236 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Study` active-card correction.

## Stage 236 Audit Snapshot

- Stage 236 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, full Study, queue-open Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 235 succeeded overall: focused `Study` no longer reads like a tall co-equal active-card column beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Notes` at the same breakpoint when no note is active; its right `Note detail` panel still spends a full support column on a mostly empty state beside the Reader.
- Stage 237 should deflate the narrower-width focused `Notes` empty-detail panel while preserving source continuity, notes behavior, and the Stage 229 split balance.

## Stage 237 Implementation Snapshot

- Stage 237 refreshed the localhost narrower-width focused overview, focused `Notes`, full focused `Notes`, and Reader captures after the focused `Notes` empty-detail deflation pass at `820x980`.
- Focused `Notes` now uses a calmer empty-detail lane with lighter blank-state shell chrome, tighter empty messaging, and less duplicate helper framing so Reader stays more clearly primary at the narrow breakpoint.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Notes` empty-detail panel deflated.
- Stage 238 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Notes` correction.

## Stage 238 Audit Snapshot

- Stage 238 refreshed the localhost narrower-width focused overview, Notes, full Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 237 succeeded overall: focused `Notes` no longer spends a full blank detail lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Graph` again at the same breakpoint; its right `Node detail` lane still stacks too much selected-node summary chrome before mentions and evidence begin.
- Stage 239 should flatten the narrower-width focused `Graph` detail stack while preserving source continuity, graph behavior, and the Stage 229 split balance.

## Stage 239 Implementation Snapshot

- Stage 239 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Notes`, focused `Study`, and Reader captures after the focused `Graph` detail-stack flattening pass at `820x980`.
- Focused `Graph` now uses a tighter selected-node summary stack with calmer meta chrome, no empty stage panels, and earlier `Mentions` entry so the right lane feels lighter beside Reader.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Graph` detail stack deflated.
- Stage 240 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Graph` correction.

## Stage 240 Audit Snapshot

- Stage 240 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 239 succeeded overall: focused `Graph` no longer spends a tall pre-mentions stack on selected-node chrome, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Study` again at the same breakpoint; its right `Active card` lane still spends too much height on prompt, reveal, and rating chrome before supporting evidence begins.
- Stage 241 should flatten the narrower-width focused `Study` active-card stack while preserving source continuity, study behavior, and the Stage 229 split balance.

## Stage 241 Implementation Snapshot

- Stage 241 refreshed the localhost narrower-width focused `Study`, revealed focused `Study`, queue-open `Study`, focused overview, and Reader captures after the focused `Study` active-card-stack flattening pass at `820x980`.
- Focused `Study` now delays the rating row until reveal, uses a tighter reveal card, and shortens the focused Reader handoff labels so supporting evidence starts sooner in the right lane.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Study` active-card stack deflated.
- Stage 242 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Study` correction.

## Stage 242 Audit Snapshot

- Stage 242 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, revealed Study, queue-open Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 241 succeeded overall: focused `Study` no longer spends a tall default pre-evidence stack on reveal and disabled grading chrome, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Graph` again at the same breakpoint; its left rail still spends too much height on intro, Browse, and selected-node summary chrome before the split settles into Reader plus node evidence.
- Stage 243 should deflate the narrower-width focused `Graph` left rail while preserving source continuity, graph behavior, and the Stage 229 split balance.

## Stage 243 Implementation Snapshot

- Stage 243 refreshed the localhost narrower-width focused `Graph`, focused overview, and Reader captures after the focused `Graph` left-rail deflation pass at `820x980`.
- Focused `Graph` now hides the extra left-rail helper copy, keeps `Browse` in a tighter inline utility row, and shortens the selected-node summary card so the split reads less like three co-equal columns.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Graph` left rail deflated.
- Stage 244 should audit whether any remaining narrower-width focused-work mismatch still meaningfully leads after the focused `Graph` rail correction.

## Stage 244 Audit Snapshot

- Stage 244 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 243 succeeded overall: focused `Graph` no longer spends a tall left rail on intro and selected-node glance chrome, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is still focused `Graph` at the same breakpoint, but it has narrowed to the `Node detail` header stack before `Mentions` begins.
- Stage 245 should deflate the narrower-width focused `Graph` node-detail header while preserving source continuity, graph behavior, and the Stage 229 split balance.

## Stage 245 Implementation Snapshot

- Stage 245 refreshed the localhost narrower-width focused `Graph`, focused overview, and Reader captures after the focused `Graph` node-detail-header deflation pass at `820x980`.
- Focused `Graph` now moves node type into the compact meta row, hides redundant header copy at the breakpoint, removes the standalone type mini-panel when no supplementary panels remain, and lets `Mentions` begin sooner in the right lane.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Graph` node-detail header deflated.
- Stage 246 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Graph` node-detail-header correction.

## Stage 246 Audit Snapshot

- Stage 246 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 245 succeeded overall: focused `Graph` no longer spends a tall right-lane header on confirm/reject and selected-node summary chrome before `Mentions`, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Study` again at the same breakpoint; its right `Active card` lane still spends too much height on stacked prompt, reveal, supporting-evidence, and grounding chrome before the lane settles into calmer evidence.
- Because focused `Study` has remained the recurring narrow blocker across repeated audits, Stage 247 should switch back into bundled dominant-surface mode and batch the remaining right-lane reductions while preserving source continuity, study behavior, and the Stage 229 split balance.

## Stage 247 Implementation Snapshot

- Stage 247 refreshed the localhost narrower-width focused `Study`, revealed focused `Study`, queue-open focused `Study`, focused overview, and Reader captures after the bundled focused `Study` right-lane pass at `820x980`.
- Focused `Study` now groups prompt and reveal into one calmer review panel, groups supporting evidence and grounding into one support panel, shortens the visible focused evidence actions, and flattens the top active-card glance so the right lane starts useful work sooner.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the bundled focused `Study` right-lane correction landed.
- Stage 248 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the bundled focused `Study` correction.

## Stage 248 Audit Snapshot

- Stage 248 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, revealed Study, queue-open Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 247 succeeded overall: focused `Study` no longer reads like a tall stack of separate prompt, reveal, evidence, and grounding cards beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Notes` again at the same breakpoint; its empty `Note detail` state still reserves a mostly blank right column beside Reader when no note is active.
- Stage 249 should collapse that narrower-width focused `Notes` empty-detail lane while preserving source continuity, notes behavior, and the Stage 229 split balance.

## Stage 249 Implementation Snapshot

- Stage 249 refreshed the localhost narrower-width focused `Notes`, notes-drawer-open, focused overview, and Reader captures after the focused `Notes` empty-detail-lane collapse pass at `820x980`.
- Focused `Notes` now shifts the no-note guidance into the left rail, keeps the real note-detail path untouched, and uses a focused-empty layout hook so Reader no longer shares the split with a blank right support column.
- The shell compactness, focused split balance, and neighboring reader-led focused surfaces remained intact while the focused `Notes` empty-detail lane collapsed.
- Stage 250 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Notes` correction.

## Stage 250 Audit Snapshot

- Stage 250 refreshed the localhost narrower-width focused overview, Notes empty, Notes drawer-open, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 249 succeeded overall: focused `Notes` no longer reserves a blank `Note detail` lane when no note is active, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now the focused source overview at the same breakpoint; its left `Home` rail still spends a full-feeling column on one compact source card beside the summary canvas.
- Stage 251 should deflate that narrower-width focused overview rail while preserving source continuity, overview behavior, and the current focused-source gains.

## Stage 251 Implementation Snapshot

- Stage 251 refreshed the localhost narrower-width focused overview, drawer-open overview, and Reader captures after the focused overview `Home`-rail deflation pass at `820x980`.
- Focused overview now uses a narrower condensed layout hook, calmer summary-card chrome, and tighter narrow-only rail utility density so the summary canvas reads more clearly primary beside the remaining support rail.
- The shell compactness, focused split balance, focused `Study` right-lane gains, focused `Notes` empty-detail gains, and neighboring reader-led focused surfaces remained intact while the focused overview rail deflated.
- Stage 252 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused overview correction.

## Stage 252 Audit Snapshot

- Stage 252 refreshed the localhost narrower-width focused overview, drawer-open overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 251 succeeded overall: focused overview no longer spends a full-feeling left `Home` rail on one compact source card beside the summary canvas, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Study` again at the same breakpoint; its left queue utility row and highlighted refresh action still read louder than the neighboring focused rails beside Reader.
- Stage 253 should flatten that narrower-width focused `Study` left queue utility row while preserving source continuity, study behavior, and the current reader-led focused gains.

## Stage 253 Implementation Snapshot

- Stage 253 refreshed the localhost narrower-width focused `Study`, queue-open focused `Study`, focused overview, and Reader captures after the focused `Study` left queue-utility-row flattening pass at `820x980`.
- Focused `Study` now uses a calmer left utility row with smaller heading scale, quieter queue/refresh controls, and lighter summary-card chrome so the rail reads closer to the neighboring focused surfaces.
- The shell compactness, focused split balance, focused `Study` right-lane gains, focused `Notes` gains, and focused overview gains remained intact while the focused `Study` left rail settled down.
- Stage 254 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Study` correction.

## Stage 254 Audit Snapshot

- Stage 254 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, queue-open Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 253 succeeded overall: focused `Study` no longer gives the left queue utility row and highlighted refresh action more emphasis than the neighboring focused rails, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Graph` again at the same breakpoint; its `Node detail` decision row and selected-node header still read louder than the neighboring focused panels beside Reader.
- Stage 255 should deflate that narrower-width focused `Graph` `Node detail` decision row while preserving source continuity, graph behavior, and the current reader-led focused gains.

## Stage 255 Implementation Snapshot

- Stage 255 refreshed the localhost narrower-width focused `Graph`, focused overview, and Reader captures after the focused `Graph` decision-row deflation pass at `820x980`.
- Focused `Graph` now uses a calmer decision-row group, softer confirm/reject emphasis, and lighter selected-node meta-chip treatment so the right lane settles more quickly beside Reader.
- The shell compactness, focused split balance, focused `Study` gains, focused `Notes` gains, and focused overview gains remained intact while the focused `Graph` decision row deflated.
- Stage 256 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Graph` correction.

## Stage 256 Audit Snapshot

- Stage 256 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 255 succeeded overall: focused `Graph` no longer gives the `Node detail` decision row and selected-node header more emphasis than the neighboring focused panels, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Study` again at the same breakpoint; its `Active card` header and prompt shell still read louder than the neighboring focused panels beside Reader.
- Stage 257 should deflate that narrower-width focused `Study` `Active card` header and prompt shell while preserving source continuity, study behavior, and the current reader-led focused gains.

## Stage 257 Implementation Snapshot

- Stage 257 refreshed the localhost narrower-width focused `Study`, revealed focused `Study`, queue-open focused `Study`, focused overview, and Reader captures after the focused `Study` active-card-header/prompt-shell deflation pass at `820x980`.
- Focused `Study` now uses calmer top-shell chrome, softer metadata chips, a lighter prompt card, and a tighter reveal row so the right lane settles more quickly into supporting evidence beside Reader.
- The shell compactness, focused split balance, focused `Notes` gains, focused overview gains, and focused `Graph` gains remained intact while the focused `Study` top shell deflated.
- Stage 258 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Study` correction.

## Stage 258 Audit Snapshot

- Stage 258 refreshed the localhost narrower-width focused overview, Notes, Graph, Study, revealed Study, queue-open Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 257 succeeded overall: focused `Study` no longer gives the `Active card` header and prompt shell more emphasis than the neighboring focused panels, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch is now focused `Notes` again at the same breakpoint; its empty-state rail still spends too much height on helper copy and a full-size action stack beside Reader.
- Stage 259 should deflate that narrower-width focused `Notes` empty rail helper copy and action stack while preserving source continuity, notes behavior, and the current reader-led focused gains.

## Stage 259 Implementation Snapshot

- Stage 259 refreshed the localhost narrower-width focused `Notes`, drawer-open `Notes`, focused overview, and Reader captures after the focused `Notes` empty-rail helper-copy/action-stack deflation pass at `820x980`.
- Focused `Notes` now uses a dedicated empty-rail hook with shorter helper copy, one browse affordance instead of a duplicated action stack, and calmer summary-card chrome so the left rail settles sooner beside Reader.
- The shell compactness, focused split balance, focused overview gains, focused `Graph` gains, and focused `Study` gains remained intact while the focused `Notes` empty rail deflated.
- Stage 260 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Notes` empty-rail correction.

## Stage 260 Audit Snapshot

- Stage 260 refreshed the localhost narrower-width focused overview, Notes empty, Notes drawer-open, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 259 succeeded overall: focused `Notes` no longer spends a full helper-copy-plus-action stack beside Reader in its default empty state, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch stays within focused `Notes` at the same breakpoint; once the user opens browsing, the drawer-open empty state still spends too much height on helper copy, filters, and a blank-state card while `Note detail` remains mostly empty.
- Stage 261 should deflate that narrower-width focused `Notes` drawer-open empty browse state while preserving source continuity, notes behavior, and the current reader-led focused gains.

## Stage 261 Implementation Snapshot

- Stage 261 refreshed the localhost narrower-width focused `Notes` empty, focused `Notes` drawer-open empty, focused overview, and Reader captures after the focused `Notes` drawer-open empty-state deflation pass at `820x980`.
- Focused `Notes` now uses a dedicated drawer-open empty-state hook with a calmer side-rail treatment, tighter source/search controls, and a smaller no-notes card so the open browse state reads more like a transitional utility panel than a full competing column.
- The shell compactness, default focused `Notes` empty-rail gains, focused overview gains, focused `Graph` gains, and focused `Study` gains remained intact while the drawer-open empty browse state deflated.
- Stage 262 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Notes` drawer-open correction.

## Stage 262 Audit Snapshot

- Stage 262 refreshed the localhost narrower-width focused overview, Notes empty, Notes drawer-open empty, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 261 succeeded overall: the open focused `Notes` browse state is calmer and less column-like than the Stage 260 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining highest-leverage mismatch stays within focused `Notes` at the same breakpoint; after the rail and filter stack settle, the still-mostly-empty `Note detail` panel now stands out as the next narrow empty state that takes more weight than it earns.
- Stage 263 should deflate that narrower-width focused `Notes` drawer-open empty `Note detail` panel while preserving source continuity, notes behavior, and the current focused gains.

## Stage 263 Implementation Snapshot

- Stage 263 refreshed the localhost narrower-width focused `Notes` empty, focused `Notes` drawer-open empty, focused overview, and Reader captures after the focused `Notes` drawer-open empty-detail-panel deflation pass at `820x980`.
- Focused `Notes` now uses a dedicated drawer-open empty-detail hook with calmer narrow-only panel chrome, shorter helper copy, and a compact blank-state chip so the `Note detail` destination reads more temporary than the pre-Stage-263 version.
- The shell compactness, focused `Notes` drawer-open browse-empty gains, focused overview gains, focused `Graph` gains, and focused `Study` gains remained intact while the empty detail panel deflated.
- Stage 264 should audit whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Notes` empty-detail correction.

## Stage 264 Audit Snapshot

- Stage 264 refreshed the localhost narrower-width focused overview, Notes empty, Notes drawer-open empty, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 263 succeeded overall: the drawer-open focused `Notes` `Note detail` panel is now a compact support state rather than a large mostly blank destination, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Notes` no longer materially leading, the remaining highest-leverage mismatch shifts back to focused `Graph` at the same breakpoint; the right `Node detail` lane still spends too much top-of-panel height on review copy, decision chrome, and selected-node summary shell before grounded mentions begin.
- Stage 265 should deflate that narrower-width focused `Graph` `Node detail` pre-`Mentions` shell while preserving graph behavior, source continuity, and the current focused gains.

## Stage 265 Implementation Snapshot

- Stage 265 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Study`, and Reader captures after the focused `Graph` `Node detail` pre-`Mentions` shell deflation pass at `820x980`.
- The `Node detail` lane now uses tighter toolbar spacing, calmer decision-row chrome, a compact selected-node summary hook, and earlier `Mentions` entry so the top-of-panel shell reads shorter than the Stage 264 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 264 baseline in the fresh validation set.
- Stage 266 should audit whether focused `Graph` still materially leads after that calmer pre-`Mentions` shell.

## Stage 266 Audit Snapshot

- Stage 266 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 265 succeeded overall: focused `Graph` no longer spends as much height on review copy, decision chrome, and selected-node framing before grounded mentions begin, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the highest-leverage narrow-width mismatch after Stage 266, but the residual issue is now localized enough for bundled dominant-surface mode: the `Node detail` header/actions, selected-node glance, and first grounded evidence still read like separate mini-zones beside Reader.
- Stage 267 should bundle the remaining narrower-width focused `Graph` `Node detail` lane deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 267 Implementation Snapshot

- Stage 267 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Study`, and Reader captures after the bundled focused `Graph` `Node detail` lane pass at `820x980`.
- The `Node detail` lane now treats its header/actions, selected-node glance, and first grounded evidence cards as one calmer support flow with less internal card-to-card separation than the Stage 266 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 266 baseline in the fresh validation set.
- Stage 268 should audit whether focused `Graph` still materially leads after that bundled lane correction.

## Stage 268 Audit Snapshot

- Stage 268 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 267 succeeded overall: focused `Graph` no longer reads like separate stacked mini-panels before grounded evidence begins, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Graph` materially calmer, the next highest-leverage mismatch shifts back to focused `Study` at the same breakpoint; the right lane still reads like two stacked destination cards (`Active card` and `Supporting evidence`) beside Reader.
- Stage 269 should bundle the remaining narrower-width focused `Study` right-lane panel fusion while preserving study behavior, source continuity, and the current focused gains.

## Stage 269 Implementation Snapshot

- Stage 269 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled focused `Study` right-lane fusion pass at `820x980`.
- The right lane now uses a lighter metadata strip, a tighter review card, and an evidence block that reads more like a continuation section than a second destination panel.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 268 baseline in the fresh validation set.
- Stage 270 should audit whether focused `Study` still materially leads after that bundled right-lane fusion.

## Stage 270 Audit Snapshot

- Stage 270 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, queue-open Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 269 succeeded overall: the default focused `Study` right lane is materially calmer and more continuous than the Stage 268 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining narrow mismatch stays on focused `Study`, but it is now localized to the answer-shown state: the rating row and supporting evidence still stack too tall beside Reader even after the broader panel-fusion pass.
- Stage 271 should compress that narrower-width focused `Study` answer-shown stack while preserving study behavior, source continuity, and the current focused gains.

## Stage 271 Implementation Snapshot

- Stage 271 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the focused `Study` answer-shown stack-compression pass at `820x980`.
- The answer-shown lane now uses a tighter rating seam, smaller action pills, and a slimmer supporting-evidence continuation than the Stage 270 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 270 baseline in the fresh validation set.
- Stage 272 should audit whether focused `Study` still materially leads after that narrower answer-shown compression.

## Stage 272 Audit Snapshot

- Stage 272 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 271 succeeded overall: the answer-shown focused `Study` lane is shorter and calmer than the Stage 270 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- The remaining narrow mismatch still stays on focused `Study`, and it is now localized enough to keep bundled dominant-surface mode active: the answer-shown right lane still reads more like stacked destinations than one quiet continuation beside Reader.
- Stage 273 should bundle the remaining narrower-width focused `Study` answer-shown right-lane deflation while preserving study behavior, source continuity, and the current focused gains.

## Stage 273 Implementation Snapshot

- Stage 273 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled answer-shown focused `Study` right-lane deflation pass at `820x980`.
- The answer-shown lane now uses a tighter prompt/answer shell, a single-line rating row, and a more continuation-like supporting-evidence section than the Stage 272 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 272 baseline in the fresh validation set.
- Stage 274 should audit whether focused `Study` still materially leads after that bundled answer-shown deflation.

## Stage 274 Audit Snapshot

- Stage 274 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 273 succeeded overall: the answer-shown focused `Study` lane now reads materially calmer and more continuous than the Stage 272 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Study` materially calmer again, the lead narrow mismatch shifts back to focused `Graph`: the `Node detail` support stack still reads louder than neighboring narrow focused surfaces because the first grounded evidence card and stacked Reader handoff controls remain too assertive beside Reader.
- Stage 275 should bundle the remaining narrower-width focused `Graph` `Node detail` support-stack deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 275 Implementation Snapshot

- Stage 275 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Study`, and Reader captures after the bundled focused `Graph` `Node detail` support-stack deflation pass at `820x980`.
- The `Node detail` lane now uses a calmer decision-row seam, a lighter leading grounded-evidence card, and smaller Reader handoff pills than the Stage 274 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 274 baseline in the fresh validation set.
- Stage 276 should audit whether focused `Graph` still materially leads after that bundled support-stack deflation.

## Stage 276 Audit Snapshot

- Stage 276 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 275 succeeded overall: focused `Graph` no longer reads like the loudest narrow support lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Graph` materially calmer again, the lead narrow mismatch shifts back to focused `Study`: the answer-shown right lane still reads more like stacked destinations than one quiet continuation because the rating seam and supporting-evidence continuation still stand out beside Reader.
- Stage 277 should bundle the remaining narrower-width focused `Study` answer-shown support-continuation deflation while preserving study behavior, source continuity, and the current focused gains.

## Stage 277 Implementation Snapshot

- Stage 277 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled answer-shown support-continuation deflation pass at `820x980`.
- The answer-shown lane now uses a tighter rating seam, smaller evidence controls, and a flatter grounding continuation than the Stage 276 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 276 baseline in the fresh validation set.
- Stage 278 should audit whether focused `Study` still materially leads after that bundled continuation pass.

## Stage 278 Audit Snapshot

- Stage 278 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 277 succeeded overall: the answer-shown focused `Study` lane no longer reads like the loudest narrow support lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Study` materially calmer again, the lead narrow mismatch shifts back to focused `Graph`: the `Node detail` lane still reads a bit too much like a repeated mentions column because the stacked grounded-evidence cards and repeated handoff rows still accumulate too much weight beside Reader.
- Stage 279 should bundle the remaining narrower-width focused `Graph` mentions-stack continuation deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 279 Implementation Snapshot

- Stage 279 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Study`, and Reader captures after the bundled focused `Graph` mentions-stack continuation deflation pass at `820x980`.
- The `Node detail` lane now uses lighter trailing mention cards, a shorter repeated excerpt rhythm, and smaller repeated Reader handoff rows than the Stage 278 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 278 baseline in the fresh validation set.
- Stage 280 should audit whether focused `Graph` still materially leads after that bundled mentions-stack continuation pass.

## Stage 280 Audit Snapshot

- Stage 280 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 279 succeeded overall: the focused `Graph` `Node detail` lane no longer reads like the loudest narrow support lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 280, but it has narrowed to the trailing mention rows: the repeated title/meta/action chrome beneath the leading evidence card still accumulates a bit too much visual weight beside Reader.
- Stage 281 should bundle the remaining narrower-width focused `Graph` trailing-mentions density deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 281 Implementation Snapshot

- Stage 281 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Study`, and Reader captures after the bundled focused `Graph` trailing-mentions density deflation pass at `820x980`.
- The `Node detail` trailing mention rows now demote repeated-source labels, use calmer trailing meta treatment, and carry a tighter repeated action seam than the Stage 280 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 280 baseline in the fresh validation set.
- Stage 282 should audit whether focused `Graph` still materially leads after that bundled trailing-mentions density pass.

## Stage 282 Audit Snapshot

- Stage 282 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 281 succeeded overall: focused `Graph` no longer reads like the loudest narrow support lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Graph` materially calmer again, the lead narrow mismatch shifts back to answer-shown focused `Study`: the right-lane shell, rating row, and supporting-evidence controls still accumulate a bit too much destination chrome beside Reader.
- Stage 283 should bundle the remaining narrower-width focused `Study` answer-shown support-controls deflation while preserving study behavior, source continuity, and the current focused gains.

## Stage 283 Implementation Snapshot

- Stage 283 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled answer-shown support-controls deflation pass at `820x980`.
- The answer-shown focused `Study` lane now uses a tighter glance strip, smaller rating pills, and a lighter supporting-evidence action seam than the Stage 282 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 282 baseline in the fresh validation set.
- Stage 284 should audit whether answer-shown focused `Study` still materially leads after that bundled support-controls pass.

## Stage 284 Audit Snapshot

- Stage 284 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 283 succeeded overall: answer-shown focused `Study` no longer reads like the loudest narrow support lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With answer-shown focused `Study` materially calmer again, the lead narrow mismatch shifts back to focused `Graph`: the trailing mention rows still accumulate a bit too much confidence/action-column chrome beneath the leading evidence card beside Reader.
- Stage 285 should bundle the remaining narrower-width focused `Graph` trailing-mentions action-column deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 285 Implementation Snapshot

- Stage 285 refreshed the localhost narrower-width focused `Graph`, focused overview, focused `Study`, and Reader captures after the bundled focused `Graph` trailing-mentions action-column deflation pass at `820x980`.
- The `Node detail` trailing mention rows now use a flatter continuation rhythm with a smaller confidence readout and a calmer inline action seam instead of a repeated right-side utility column.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 284 baseline in the fresh validation set.
- Stage 286 should audit whether focused `Graph` still materially leads after that bundled trailing-row action-column pass.

## Stage 286 Audit Snapshot

- Stage 286 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 285 succeeded overall: focused `Graph` trailing mention rows no longer read like the loudest narrow support seam beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Graph` materially calmer again, the lead narrow mismatch shifts back to answer-shown focused `Study`: the rating seam and supporting-evidence continuation still read a bit too much like a stacked destination block beside Reader.
- Stage 287 should bundle the remaining narrower-width answer-shown focused `Study` rating/support seam deflation while preserving study behavior, source continuity, and the current focused gains.

## Stage 287 Implementation Snapshot

- Stage 287 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled answer-shown focused `Study` rating/support seam deflation pass at `820x980`.
- The answer-shown right lane now uses a lighter rating seam, tighter support-header actions, and a calmer handoff into the single evidence block than the Stage 286 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 286 baseline in the fresh validation set.
- Stage 288 should audit whether answer-shown focused `Study` still materially leads after that bundled seam pass.

## Stage 288 Audit Snapshot

- Stage 288 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 287 succeeded overall: the answer-shown focused `Study` rating/support seam no longer reads like the loudest narrow support lane beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With answer-shown focused `Study` materially calmer again, the lead narrow mismatch shifts back to focused `Graph`: the trailing same-source mention rows still accumulate a bit too much repeated density beneath the leading evidence card beside Reader.
- Stage 289 should bundle the remaining narrower-width focused `Graph` trailing same-source row density deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 289 Implementation Snapshot

- Stage 289 refreshed the localhost narrower-width focused `Graph`, focused overview, and Reader captures after the bundled focused `Graph` trailing same-source row-density deflation pass at `820x980`.
- The trailing same-source `Node detail` rows now fall into a lighter continuation rhythm with quieter repeated-source treatment, denser trailing-row copy, and a smaller trailing action seam than the Stage 288 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 288 baseline in the fresh validation set.
- Stage 290 should audit whether focused `Graph` still materially leads after that bundled same-source-density pass.

## Stage 290 Audit Snapshot

- Stage 290 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 289 succeeded overall: focused `Graph` trailing same-source rows no longer read like the loudest narrow support seam beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With focused `Graph` materially calmer again, the lead narrow mismatch shifts back to answer-shown focused `Study`: the rating row and supporting-evidence header still keep a bit too much destination-style chrome beside Reader.
- Stage 291 should bundle the remaining narrower-width answer-shown focused `Study` rating-row/support-header compaction while preserving study behavior, source continuity, and the current focused gains.

## Stage 291 Implementation Snapshot

- Stage 291 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled answer-shown focused `Study` rating-row/support-header compaction pass at `820x980`.
- The answer-shown right lane now uses a tighter inline rating seam and a flatter supporting-evidence header/action continuation than the Stage 290 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 290 baseline in the fresh validation set.
- Stage 292 should audit whether answer-shown focused `Study` still materially leads after that bundled row/header pass.

## Stage 292 Audit Snapshot

- Stage 292 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader top-state captures at `820x980`.
- The new capture set confirmed that Stage 291 succeeded overall: the answer-shown focused `Study` rating row and supporting-evidence header no longer read like the loudest narrow support seam beside Reader, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- With answer-shown focused `Study` materially calmer again, the lead narrow mismatch shifts back to focused `Graph`: the trailing same-source mention rows still keep a bit too much repeated confidence/action seam beneath the leading evidence card beside Reader.
- Stage 293 should bundle the remaining narrower-width focused `Graph` trailing same-source confidence/action-seam deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 293 Implementation Snapshot

- Stage 293 refreshed the localhost narrower-width focused `Graph`, focused overview, and Reader captures after the bundled focused `Graph` trailing same-source confidence/action-seam deflation pass at `820x980`.
- The trailing same-source rows now keep confidence and Reader handoff actions in one calmer utility seam instead of splitting them across separate stacked cues.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 292 baseline in the fresh validation set.
- Stage 294 should audit whether focused `Graph` still materially leads after that bundled seam pass.

## Stage 294 Audit Snapshot

- Stage 294 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 293 succeeded overall: focused `Graph` trailing same-source rows now read materially calmer and less ledger-like than the Stage 292 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 294, but it has narrowed to the deepest same-source continuation rows, where the tail still accumulates too many tiny utility seams beneath the leading evidence card beside Reader.
- Stage 295 should bundle the remaining narrower-width focused `Graph` deepest same-source tail-seam deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 295 Implementation Snapshot

- Stage 295 refreshed the localhost narrower-width focused `Graph`, focused overview, and Reader captures after the bundled focused `Graph` deepest same-source tail-seam deflation pass at `820x980`.
- The deepest same-source continuation rows now keep a quieter lowest-row seam with smaller repeated confidence/action cues and softer deepest-tail action treatment than the Stage 294 version.
- Focused overview and Reader stayed visually aligned with the calmer Stage 294 baseline in the fresh validation set.
- Stage 296 should audit whether focused `Graph` still materially leads after that bundled deepest-tail seam pass.

## Stage 296 Audit Snapshot

- Stage 296 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, deepest same-source Graph tail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 295 succeeded overall: the deepest same-source focused `Graph` tail now reads materially calmer than the Stage 294 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 296 because the surface still reads too much like a three-part composition, and the deepest same-source continuation rows still keep a busy stacked mini-row rhythm beneath the leading evidence card beside Reader.
- Stage 297 should bundle the remaining narrower-width focused `Graph` deepest same-source tail row-rhythm deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 297 Implementation Snapshot

- Stage 297 refreshed the localhost narrower-width focused `Graph`, deepest same-source Graph tail, focused overview, and Reader captures after the bundled focused `Graph` deepest same-source tail row-rhythm deflation pass at `820x980`.
- The deepest same-source continuation rows now use a dedicated deep-tail hook, a quieter one-line continuation preview, a hidden deepest-tail confidence seam, and lighter deepest-row action treatment than the Stage 296 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 296 baseline in the fresh validation set.
- Stage 298 should audit whether focused `Graph` still materially leads after that bundled deepest-tail rhythm pass.

## Stage 298 Audit Snapshot

- Stage 298 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, deepest same-source Graph tail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 297 succeeded overall: the deepest same-source focused `Graph` tail now reads materially calmer and less ladder-like than the Stage 296 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 298, but the issue has shifted up from the deepest tail into the overall right-lane composition: the `Node detail` lane still reads a bit too much like a separate boxed destination because the leading evidence card and same-source continuation cluster remain too segmented beneath `Mentions` beside Reader.
- Stage 299 should bundle the remaining narrower-width focused `Graph` `Node detail` continuation-stack fusion while preserving graph behavior, source continuity, and the current focused gains.

## Stage 299 Implementation Snapshot

- Stage 299 refreshed the localhost narrower-width focused `Graph`, focused `Graph` continuation-stack detail, focused overview, and Reader captures after the bundled focused `Graph` `Node detail` continuation-stack fusion pass at `820x980`.
- The `Mentions` stack now uses grouped source runs, a localized leading-source cluster wrapper, and a calmer seam between the first grounded evidence card and its same-source continuation rows than the Stage 298 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 298 baseline in the fresh validation set.
- Stage 300 should audit whether focused `Graph` still materially leads after that bundled continuation-stack fusion pass.

## Stage 300 Audit Snapshot

- Stage 300 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` continuation-stack detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 299 succeeded overall: the focused `Graph` `Node detail` continuation stack now reads more continuous and less ladder-like than the Stage 298 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 300, but it has narrowed again: the `Mentions` entry and first grounded evidence card still read a bit too much like a separate boxed destination before the calmer same-source continuation cluster beside Reader.
- Stage 301 should bundle the remaining narrower-width focused `Graph` `Mentions` entry and leading-card seam deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 301 Implementation Snapshot

- Stage 301 refreshed the localhost narrower-width focused `Graph`, focused `Graph` `Mentions` entry seam detail, focused overview, and Reader captures after the bundled focused `Graph` `Mentions` entry and leading-card seam deflation pass at `820x980`.
- The focused `Graph` `Node detail` `Mentions` entry now uses a calmer compact heading seam, a quieter grounded-mention count, and a lighter leading-source cluster seam than the Stage 300 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 300 baseline in the fresh validation set.
- Stage 302 should audit whether focused `Graph` still materially leads after that bundled `Mentions` entry and leading-card seam pass.

## Stage 302 Audit Snapshot

- Stage 302 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` `Mentions` entry seam detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 301 succeeded overall: the focused `Graph` `Mentions` entry now reads more like the start of one calmer support flow than the Stage 300 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 302, but it has narrowed again: the leading grounded evidence card and its immediate same-source bridge beneath `Mentions` still read slightly too much like a boxed destination before the calmer continuation cluster beside Reader.
- Stage 303 should bundle the remaining narrower-width focused `Graph` leading grounded evidence card and same-source bridge deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 303 Implementation Snapshot

- Stage 303 refreshed the localhost narrower-width focused `Graph`, focused `Graph` leading grounded evidence card detail, focused overview, and Reader captures after the bundled focused `Graph` leading-card and same-source-bridge deflation pass at `820x980`.
- The focused `Graph` leading grounded evidence card and its immediate same-source bridge now use a lighter cluster shell, a softer bridge seam, and calmer bridge utility chrome than the Stage 302 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 302 baseline in the fresh validation set.
- Stage 304 should audit whether focused `Graph` still materially leads after that bundled leading-card and same-source-bridge pass.

## Stage 304 Audit Snapshot

- Stage 304 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` leading grounded evidence card detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 303 succeeded overall: the focused `Graph` leading grounded evidence card and immediate same-source bridge now read less like a boxed destination than the Stage 302 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 304, but it has narrowed again: the same-source continuation tail beneath the softened leading bridge still reads like a compact mini-ledger with repeated utility seams beside Reader.
- Stage 305 should bundle the remaining narrower-width focused `Graph` same-source continuation-tail deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 305 Implementation Snapshot

- Stage 305 refreshed the localhost narrower-width focused `Graph`, focused `Graph` same-source continuation-tail detail, focused overview, and Reader captures after the bundled focused `Graph` same-source continuation-tail deflation pass at `820x980`.
- The same-source continuation tail now uses softer row borders, tighter preview rhythm, and calmer repeated utility treatment than the Stage 304 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 304 baseline in the fresh validation set.
- Stage 306 should audit whether focused `Graph` still materially leads after that bundled same-source continuation-tail pass.

## Stage 306 Audit Snapshot

- Stage 306 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation-tail detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 305 succeeded overall: the focused `Graph` same-source continuation tail now reads less like a compact mini-ledger than the Stage 304 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 306, but it has narrowed again: the repeated confidence plus `Show` / `Open` utility seam in the same-source continuation rows still reads a little too ledger-like beside Reader.
- Stage 307 should bundle the remaining narrower-width focused `Graph` same-source continuation utility-seam deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 307 Implementation Snapshot

- Stage 307 refreshed the localhost narrower-width focused `Graph`, focused `Graph` same-source continuation utility-seam detail, focused overview, and Reader captures after the bundled focused `Graph` same-source continuation utility-seam deflation pass at `820x980`.
- The same-source continuation rows now use calmer continuation action typography, quieter inline confidence treatment, and a less pill-like repeated `Show` / `Open` seam than the Stage 306 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 306 baseline in the fresh validation set.
- Stage 308 should audit whether focused `Graph` still materially leads after that bundled utility-seam pass.

## Stage 308 Audit Snapshot

- Stage 308 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation utility-seam detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 307 succeeded overall: the focused `Graph` same-source continuation seam now reads calmer and less pill-like than the Stage 306 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 308, but it has narrowed again: the same-source continuation rows still keep a tiny right-edge utility column beneath the softened leading bridge, so the `Node detail` lane still feels a little too segmented beside Reader.
- Stage 309 should bundle the remaining narrower-width focused `Graph` same-source continuation utility-column flattening while preserving graph behavior, source continuity, and the current focused gains.

## Stage 309 Implementation Snapshot

- Stage 309 refreshed the localhost narrower-width focused `Graph`, focused `Graph` same-source continuation utility-column detail, focused overview, and Reader captures after the bundled focused `Graph` same-source continuation utility-column flattening pass at `820x980`.
- The same-source continuation rows now collapse the empty head slot, use a left-aligned follow-on action row, and read less like a tiny right-edge utility column than the Stage 308 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 308 baseline in the fresh validation set.
- Stage 310 should audit whether focused `Graph` still materially leads after that bundled utility-column pass.

## Stage 310 Audit Snapshot

- Stage 310 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation utility-column detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 309 succeeded overall: the focused `Graph` same-source continuation rows now read less like a tiny right-edge utility column than the Stage 308 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 310, but it has narrowed again: the same-source continuation rows still read like a separate follow-on stack beneath the leading grounded evidence card, so the `Node detail` lane still feels a bit too segmented beside Reader.
- Stage 311 should bundle the remaining narrower-width focused `Graph` same-source continuation follow-on stack softening while preserving graph behavior, source continuity, and the current focused gains.

## Stage 311 Implementation Snapshot

- Stage 311 refreshed the localhost narrower-width focused `Graph`, focused `Graph` same-source continuation follow-on stack detail, focused overview, and Reader captures after the bundled focused `Graph` same-source continuation follow-on stack softening pass at `820x980`.
- The bridge between the leading grounded evidence card and the same-source continuation flow now uses calmer seam treatment, hides the bridge row's restart-like head/meta chrome, and reads more like a continuation than the Stage 310 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 310 baseline in the fresh validation set.
- Stage 312 should audit whether focused `Graph` still materially leads after that bundled follow-on stack pass.

## Stage 312 Audit Snapshot

- Stage 312 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation follow-on stack detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 311 succeeded overall: the focused `Graph` bridge no longer restarts the same-source continuation flow like the Stage 310 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 312, but it has narrowed again: the remaining same-source continuation rows still form a visible little preview/action ladder beneath the softened bridge, so the `Node detail` lane still feels a bit too segmented beside Reader.
- Stage 313 should bundle the remaining narrower-width focused `Graph` same-source continuation ladder softening while preserving graph behavior, source continuity, and the current focused gains.

## Stage 313 Implementation Snapshot

- Stage 313 refreshed the localhost narrower-width focused `Graph`, focused `Graph` same-source continuation ladder detail, focused overview, and Reader captures after the bundled focused `Graph` same-source continuation ladder softening pass at `820x980`.
- The same-source continuation ladder now uses tighter in-cluster row rhythm, softer continuation seams, and less repeated confidence/action emphasis than the Stage 312 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 312 baseline in the fresh validation set.
- Stage 314 should audit whether focused `Graph` still materially leads after that bundled ladder-softening pass.

## Stage 314 Audit Snapshot

- Stage 314 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation ladder detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 313 succeeded overall: the focused `Graph` continuation ladder now reads quieter and less segmented than the Stage 312 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 314, but it has narrowed again: the deepest same-source continuation rows still collect into a tiny repeated one-line tail beneath the calmer ladder, so the `Node detail` lane still feels a bit too tall and segmented beside Reader.
- Stage 315 should bundle the remaining narrower-width focused `Graph` deepest same-source continuation-tail compaction while preserving graph behavior, source continuity, and the current focused gains.

## Stage 315 Validation Snapshot

- Stage 315 refreshed the localhost narrower-width focused `Graph`, focused `Graph` deepest same-source continuation-tail detail, focused overview, and Reader captures after the bundled continuation-tail inline-compaction pass at `820x980`.
- The deepest same-source continuation tail now uses softer preview text, flatter tiny action seams, and calmer consecutive-row rhythm than the Stage 314 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 314 baseline in the fresh validation set.
- Stage 316 should audit whether focused `Graph` still materially leads after that inline-compaction pass.

## Stage 316 Audit Snapshot

- Stage 316 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` deepest same-source continuation-tail detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 315 succeeded overall: the focused `Graph` deepest same-source continuation tail now reads calmer and less repetitive than the Stage 314 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 316, but it has narrowed again: the deepest same-source continuation tail still reads like the last tiny repeated inline list beneath the calmer ladder, so the `Node detail` lane still feels a touch too segmented beside Reader.
- Stage 317 should bundle the remaining narrower-width focused `Graph` deepest same-source tail final inline settling while preserving graph behavior, source continuity, and the current focused gains.

## Stage 317 Validation Snapshot

- Stage 317 refreshed the localhost narrower-width focused `Graph`, focused `Graph` deepest same-source tail detail, focused overview, and Reader captures after the bundled final inline-settling pass at `820x980`.
- The deepest same-source continuation tail now uses a flatter inline seam, softer deepest-tail preview text, and calmer micro-action rhythm than the Stage 316 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 316 baseline in the fresh validation set.
- Stage 318 should audit whether focused `Graph` still materially leads after that final inline-settling pass.

## Stage 318 Audit Snapshot

- Stage 318 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` deepest same-source tail detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 317 succeeded overall: the focused `Graph` deepest same-source continuation tail now reads flatter and more inline than the Stage 316 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still remains the lead narrow mismatch after Stage 318, but it has narrowed again: the deepest same-source continuation tail still accumulates as a tiny muted micro-list beneath the calmer ladder, so the `Node detail` lane still feels a touch too segmented beside Reader.
- Stage 319 should bundle the remaining narrower-width focused `Graph` deepest same-source tail micro-list deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 319 Validation Snapshot

- Stage 319 refreshed the localhost narrower-width focused `Graph`, focused `Graph` deepest same-source tail detail, focused overview, and Reader captures after the bundled micro-list-deflation pass at `820x980`.
- The deepest same-source continuation tail now uses a more text-like inline preview/action seam and a softer trailing utility rhythm than the Stage 318 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 318 baseline in the fresh validation set.
- Stage 320 should audit whether focused `Graph` still materially leads after that micro-list-deflation pass.

## Stage 320 Audit Snapshot

- Stage 320 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` deepest same-source tail detail, Study, answer-shown Study, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 319 succeeded overall: the focused `Graph` deepest same-source continuation tail now reads more text-like and less ladder-like than the Stage 318 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` no longer appears to be the lead narrow mismatch after Stage 320. Focused `Study` now leads because the right `Active card` prompt/support shell still reads too much like a second destination panel beside Reader in both pre-answer and answer-shown states.
- Stage 321 should bundle the remaining narrower-width focused `Study` right-lane prompt/support-shell deflation while preserving study behavior, source continuity, and the current focused gains.

## Stage 321 Implementation Snapshot

- Stage 321 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, focused `Graph`, and Reader captures after the bundled focused `Study` right-lane prompt/support-shell deflation pass at `820x980`.
- The focused `Study` right lane now uses flatter bundled-panel framing, tighter review/reveal seams, calmer supporting-evidence continuation chrome, and a lighter focused evidence card than the Stage 320 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 320 baseline in the fresh validation set.
- Stage 322 should audit whether focused `Study` still materially leads after that bundled shell-deflation pass.

## Stage 322 Audit Snapshot

- Stage 322 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 321 succeeded overall: the focused `Study` right lane now reads calmer and less boxed than the Stage 320 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Study` still appears to be the lead narrow mismatch after Stage 322, but it has narrowed again: the prompt card, reveal seam, and support continuation still read slightly too much like stacked destination panels beside Reader in both pre-answer and answer-shown states.
- Stage 323 should bundle the remaining narrower-width focused `Study` prompt/reveal/support-stack fusion while preserving study behavior, source continuity, and the current focused gains.

## Stage 323 Implementation Snapshot

- Stage 323 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, focused `Graph`, and Reader captures after the bundled focused `Study` prompt/reveal/support-stack fusion pass at `820x980`.
- The focused `Study` right lane now uses tighter review seams, calmer reveal chrome, flatter evidence-header treatment, and more continuation-like evidence/grounding styling than the Stage 322 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 322 baseline in the fresh validation set.
- Stage 324 should audit whether focused `Study` still materially leads after that bundled stack-fusion pass.

## Stage 324 Audit Snapshot

- Stage 324 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 323 succeeded overall: the focused `Study` right lane now reads more continuous and less stacked than the Stage 322 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Study` still appears to be the lead narrow mismatch after Stage 324, but it has narrowed again: the supporting-evidence excerpt and grounding continuation still read slightly too much like a second destination block beside Reader, especially in the answer-shown state.
- Stage 325 should bundle the remaining narrower-width focused `Study` supporting-evidence and grounding continuation softening while preserving study behavior, source continuity, and the current focused gains.

## Stage 325 Validation Snapshot

- Stage 325 refreshed the localhost narrower-width focused `Study`, answer-shown focused `Study`, focused overview, and Reader captures after the bundled focused `Study` supporting-evidence and grounding continuation softening pass at `820x980`.
- The focused `Study` right lane now uses a lighter evidence excerpt seam, no repeated evidence metadata in the narrow fused block, and a calmer grounding continuation than the Stage 324 version.
- Focused overview, neighboring focused `Graph`, and Reader stayed visually aligned with the calmer Stage 324 baseline in the fresh validation set.
- Stage 326 should audit whether focused `Study` still materially leads after that bundled supporting-evidence pass.

## Stage 326 Audit Snapshot

- Stage 326 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 325 succeeded overall: the focused `Study` evidence and grounding continuation now read lighter and less boxed than the Stage 324 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` now appears to be the lead narrow mismatch after Stage 326: the `Node detail` `Mentions` entry and leading grounded evidence card/action seam still read slightly too much like a destination block beside Reader.
- Stage 327 should bundle the remaining narrower-width focused `Graph` leading mention-card and action-seam deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 327 Validation Snapshot

- Stage 327 refreshed the localhost narrower-width focused `Graph`, focused `Graph` leading mention-card/action-seam detail, focused overview, focused `Study`, answer-shown focused `Study`, and Reader captures after the bundled focused `Graph` leading mention-card and action-seam deflation pass at `820x980`.
- The focused `Graph` right lane now uses a lighter `Mentions` entry seam, softer leading source-run framing, and calmer leading handoff actions than the Stage 326 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 326 baseline in the fresh validation set.
- Stage 328 should audit whether focused `Graph` still materially leads after that bundled leading-card/action-seam pass.

## Stage 328 Audit Snapshot

- Stage 328 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 327 succeeded overall: the focused `Graph` `Mentions` entry and leading action seam now read calmer than the Stage 326 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still appears to be the lead narrow mismatch after Stage 328, but it has narrowed again: the leading grounded-evidence preview and metadata seam still read slightly too much like a destination block above the calmer same-source continuation beside Reader.
- Stage 329 should bundle the remaining narrower-width focused `Graph` leading grounded-evidence preview/meta deflation while preserving graph behavior, source continuity, and the current focused gains.

## Stage 330 Audit Snapshot

- Stage 330 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 329 succeeded overall: Reader is visibly wider beside focused `Graph`, the selected-node glance is flatter, and the leading grounded-evidence run now reads more like one grouped support flow than the Stage 328 version.
- Focused `Graph` still appears to be the lead narrow mismatch after Stage 330, but the blocker is broader now: the whole `Node detail` rail hierarchy still reads a bit too much like a separate destination column beside Reader, not just one remaining chip or action seam.
- Stage 331 should bundle a focused `Graph` `Node detail` hierarchy reset rather than returning to another micro-stage seam pass.

## Stage 331 Validation Snapshot

- Stage 331 refreshed the localhost narrower-width focused `Graph`, focused `Graph` node-detail rail, focused overview, focused `Study`, answer-shown focused `Study`, and Reader captures after the bundled focused `Graph` hierarchy-reset pass at `820x980`.
- The focused `Graph` right lane now uses a flatter rail shell, a calmer selected-node seam, a source-run-first `Mentions` flow, and a more subordinate `Relations` continuation than the Stage 330 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 330 baseline in the fresh validation set.
- Stage 332 should audit whether focused `Graph` still materially leads after that broader rail-hierarchy reset.

## Stage 332 Audit Snapshot

- Stage 332 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 331 succeeded overall: the focused `Graph` `Node detail` rail now reads visibly flatter and less boxed than the Stage 330 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still appears to be the lead narrow mismatch after Stage 332, but the blocker has shifted again: the right rail is calmer now, yet the leading evidence/readout flow feels slightly too compressed and micro-dense beside Reader.
- Stage 333 should bundle a focused `Graph` `Node detail` readability rebalance rather than returning to another tiny seam pass.

## Stage 333 Validation Snapshot

- Stage 333 refreshed the localhost narrower-width focused `Graph`, focused `Graph` node-detail rail, focused `Graph` leading-evidence readability crop, focused overview, focused `Study`, answer-shown focused `Study`, and Reader captures after the bundled readability-rebalance pass at `820x980`.
- The focused `Graph` right lane now uses a slightly wider split, a fuller leading-evidence preview, more readable same-source continuation rows, and a more legible `Relations` continuation entry than the Stage 332 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 332 baseline in the fresh validation set.
- Stage 334 should audit whether focused `Graph` still materially leads after that broader readability rebalance.

## Stage 334 Audit Snapshot

- Stage 334 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 333 succeeded overall: the focused `Graph` `Node detail` rail is materially more readable than the Stage 332 version, the leading preview/readout flow is easier to scan, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still appears to be the lead narrow mismatch after Stage 334, but the blocker has shifted lower: the lower continuation rows plus the `Relations` footer still accumulate as a cramped tail beneath the improved top half beside Reader.
- Stage 335 should bundle a broader focused `Graph` lower-continuation and `Relations`-footer balance pass rather than returning to another tiny seam-only edit.

## Stage 335 Validation Snapshot

- Stage 335 refreshed the localhost narrower-width focused `Graph`, focused `Graph` node-detail rail, focused `Graph` lower continuation plus `Relations` footer crop, focused overview, focused `Study`, answer-shown focused `Study`, and Reader captures after the bundled lower-half balance pass at `820x980`.
- The focused `Graph` right lane now uses a grouped leading-source continuation block, calmer repeated follow-on rows, and a more readable `Relations` footer entry than the Stage 334 version.
- Focused overview, neighboring focused `Study`, and Reader stayed visually aligned with the calmer Stage 334 baseline in the fresh validation set.
- Stage 336 should audit whether focused `Graph` still materially leads after that broader lower-half balance pass.

## Stage 336 Audit Snapshot

- Stage 336 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 335 succeeded overall: the focused `Graph` lower continuation and `Relations` footer now read calmer and more legible than the Stage 334 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` no longer appears to be the lead narrow mismatch after Stage 336. Focused `Study` now leads because the boxed right `Active card` lane still reads too much like a destination panel beside Reader in both pre-answer and answer-shown states.
- Stage 337 should bundle a broader focused `Study` right-lane hierarchy reset rather than reopening another tiny focused `Graph` seam pass.

## Stage 337 Validation Snapshot

- Stage 337 refreshed the localhost narrower-width focused `Study`, focused `Study` right-lane crop, answer-shown focused `Study`, answer-shown focused `Study` right-lane crop, focused overview, focused `Graph`, focused `Notes` drawer-open empty, and Reader captures after the bundled right-lane hierarchy-reset pass at `820x980`.
- The focused `Study` right lane now uses a transparent outer shell, one softer review panel, a calmer answer-shown seam, and a more continuation-like supporting-evidence section than the Stage 336 version.
- Focused overview, neighboring focused `Graph`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 336 baseline in the fresh validation set.
- Stage 338 should audit whether focused `Study` still materially leads after that broader right-lane hierarchy reset.

## Stage 338 Audit Snapshot

- Stage 338 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, focused Study right-lane crops, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 337 succeeded overall: the focused `Study` right lane now reads materially flatter and more continuation-like than the Stage 336 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Study` no longer appears to be the lead narrow mismatch after Stage 338. Focused `Graph` now leads because the `Node detail` lane still reads too dense and ledger-like beside Reader.
- Stage 339 should bundle a broader focused `Graph` `Node detail` density reset rather than reopening another tiny focused `Study` seam pass.

## Stage 339 Validation Snapshot

- Stage 339 refreshed the localhost narrower-width focused `Graph`, focused `Graph` node-detail rail crop, focused `Graph` leading evidence/meta density crop, focused overview, focused `Study`, answer-shown focused `Study`, focused `Notes` drawer-open empty, and Reader captures after the bundled node-detail density-reset pass at `820x980`.
- The focused `Graph` right lane now uses a wider split, a stronger leading evidence preview, a calmer top utility seam, and a softer same-source bridge/continuation treatment than the Stage 338 version.
- Focused overview, neighboring focused `Study`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 338 baseline in the fresh validation set.
- Stage 340 should audit whether focused `Graph` still materially leads after that broader density reset.

## Stage 340 Audit Snapshot

- Stage 340 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` node-detail density crops, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 339 succeeded overall: the focused `Graph` `Node detail` lane is materially wider and easier to scan than the Stage 338 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still appears to be the lead narrow mismatch after Stage 340, but the blocker has shifted lower: the continuation flow beneath the improved leading preview still accumulates as a long text wall beside Reader.
- Stage 341 should bundle a broader focused `Graph` continuation-flow consolidation rather than reopening another tiny density seam pass.

## Stage 341 Validation Snapshot

- Stage 341 refreshed the localhost narrower-width focused `Graph`, focused `Graph` node-detail rail crop, focused `Graph` leading evidence/meta crop, focused `Graph` continuation-flow bundle crop, focused overview, focused `Study`, answer-shown focused `Study`, focused `Notes` drawer-open empty, and Reader captures after the bundled continuation-flow consolidation pass at `820x980`.
- The focused `Graph` right lane now splits more clearly into one leading grounded clue plus one bundled follow-on block with grouped continuation rows and a nested `Relations` continuation footer instead of one long stacked tail.
- Focused overview, neighboring focused `Study`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 340 baseline in the fresh validation set.
- Stage 342 should audit whether focused `Graph` still materially leads after that broader lower-flow consolidation.

## Stage 342 Audit Snapshot

- Stage 342 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` lower-flow crops, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 341 succeeded overall: the focused `Graph` lower continuation and `Relations` footer now read as one calmer follow-on bundle than the Stage 340 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` no longer appears to be the clearest remaining narrow mismatch after Stage 342. Focused `Study` now leads again because the right active-card flow still reads more boxed and destination-like beside Reader while the new focused `Graph` lower bundle is materially calmer.
- Stage 343 should bundle a broader focused `Study` active-card-flow reset rather than reopening another tiny focused `Graph` seam pass.

## Stage 343 Implementation Snapshot

- Stage 343 refreshed the localhost narrower-width focused overview, focused `Study`, answer-shown focused `Study`, focused Study right-lane/body-flow crops, focused `Graph`, focused `Notes` drawer-open empty, and Reader captures after the bundled active-card-flow reset at `820x980`.
- The focused `Study` right lane now reads as one shared active-card flow shell with a broader split, calmer prompt/reveal/readout framing, and a continuation-style supporting-evidence/grounding section instead of a tiny boxed destination panel.
- Focused overview, neighboring focused `Graph`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 342 baseline in the fresh validation set.
- Stage 344 should audit whether focused `Study` still materially leads after that broader active-card-flow reset.

## Stage 344 Audit Snapshot

- Stage 344 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, focused Study right-lane/body-flow crops, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 343 succeeded overall: the focused `Study` right lane now reads materially calmer and less destination-like than the Stage 342 version, and the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Study` no longer appears to be the clearest remaining narrow mismatch after Stage 344. Focused `Graph` now leads again because the lower `Node detail` follow-on bundle still reads denser and more text-wall-like beside Reader while the new focused `Study` lane is materially calmer.
- Stage 345 should bundle a broader focused `Graph` lower-bundle readability reset rather than reopening another tiny focused `Study` seam pass.

## Stage 345 Implementation Snapshot

- Stage 345 refreshed the localhost narrower-width focused overview, focused `Graph`, focused `Graph` lower-bundle crops, focused `Study`, answer-shown focused `Study`, focused `Notes` drawer-open empty, and Reader captures after the broader follow-on readability reset at `820x980`.
- The focused `Graph` lower `Node detail` continuation now reads as clearer follow-on run cards with one calmer lead excerpt and quieter list-style continuation rows instead of the old compressed text wall.
- Focused overview, neighboring focused `Study`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 344 baseline in the fresh validation set.
- Stage 346 should audit whether focused `Graph` still materially leads after that broader lower-bundle readability reset.

## Stage 346 Audit Snapshot

- Stage 346 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` follow-on bundle crops, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 345 succeeded overall: the focused `Graph` lower bundle now reads materially calmer and more legible than the Stage 344 version while the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still appears to be the clearest remaining narrow mismatch after Stage 346, but the problem has narrowed: the leading grounded-evidence card still reads too separate from the calmer lower continuation beside Reader.
- Stage 347 should bundle a broader focused `Graph` evidence-flow fusion rather than reopening another local density-only tweak.

## Stage 347 Implementation Snapshot

- Stage 347 refreshed the localhost narrower-width focused overview, focused `Graph`, focused `Graph` evidence-flow crops, focused `Study`, answer-shown focused `Study`, focused `Notes` drawer-open empty, and Reader captures after the broader evidence-flow fusion at `820x980`.
- The focused `Graph` `Node detail` lane now reads as one shared evidence-flow shell with a calmer leading evidence preview and an integrated lower continuation bundle instead of a separate leading card above a separate lower block.
- Focused overview, neighboring focused `Study`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 346 baseline in the fresh validation set.
- Stage 348 should audit whether focused `Graph` still materially leads after that broader evidence-flow fusion.

## Stage 348 Audit Snapshot

- Stage 348 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` evidence-flow crops, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 347 succeeded overall: the focused `Graph` evidence flow now reads materially more unified and less stacked than the Stage 346 version while the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` no longer appears to be the clearest remaining narrow mismatch after Stage 348. Focused `Study` now leads because the right `Active card` lane still reads more boxed and destination-like beside Reader while the new focused-Graph rail is materially calmer.
- Stage 349 should bundle a broader focused `Study` body-flow fusion rather than reopening another local focused-Graph seam.

## Stage 349 Implementation Snapshot

- Stage 349 refreshed the localhost narrower-width focused overview, focused `Study`, answer-shown focused `Study`, focused Study right-lane/body-flow crops, focused `Graph`, focused `Notes` drawer-open empty, and Reader captures after the broader body-flow fusion at `820x980`.
- The focused `Study` right lane now reads flatter and less boxed with a calmer shared shell for the prompt, reveal/answer state, rating strip, and supporting evidence instead of a standing destination panel beside Reader.
- Focused overview, neighboring focused `Graph`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 348 baseline in the fresh validation set.
- Stage 350 should audit whether focused `Study` still materially leads after that broader body-flow fusion.

## Stage 350 Audit Snapshot

- Stage 350 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, focused Study right-lane/body-flow crops, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 349 succeeded overall: the focused `Study` right lane now reads materially calmer and less boxed than the Stage 348 version while the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Study` no longer appears to be the clearest remaining narrow mismatch after Stage 350. Focused `Graph` now leads because the `Node detail` rail still reads more cramped and text-heavy beside Reader while the new focused-Study lane is materially calmer.
- Stage 351 should bundle a broader focused `Graph` rail-readability rebalance rather than reopening another local Study seam.

## Stage 351 Implementation Snapshot

- Stage 351 refreshed the localhost narrower-width focused overview, focused `Graph`, focused-Graph right-rail/readability crops, focused `Study`, answer-shown focused `Study`, focused `Notes` drawer-open empty, and Reader captures after a broader `Graph` rail-readability reset at `820x980`.
- The focused `Graph` right lane now reads visibly wider and calmer with a tighter neighboring Graph rail, a stacked `Node detail` header/action seam, a larger leading grounded clue, and a more clearly grouped lower continuation shell instead of the narrower Stage 350 side ledger.
- Focused `Study`, focused overview, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 350 baseline in the fresh validation set.
- Stage 352 should audit whether focused `Graph` still materially leads after that broader rail reset or whether the lead blocker shifts again.

## Stage 352 Audit Snapshot

- Stage 352 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` rail/readability crops, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 351 succeeded overall: the focused `Graph` `Node detail` rail is now visibly wider and less boxed than the Stage 350 version while the calmer shell, Reader, focused overview, focused `Notes`, and focused `Study` gains remain intact.
- Focused `Graph` still appears to be the clearest remaining narrow mismatch after Stage 352, but the problem is now lower in the same surface: the `More evidence` continuation still reads like a same-source text wall beneath the improved leading clue beside Reader.
- Stage 353 should stay on focused `Graph` and reset that lower continuation as another visibly broader bundled pass rather than reopening row-level seam trims.

## Stage 353 Implementation Snapshot

- Stage 353 refreshed the localhost narrower-width focused overview, focused `Graph`, focused `Graph` lower-bundle crops, focused `Study`, answer-shown focused `Study`, focused `Notes` drawer-open empty, and Reader captures after the broader lower-continuation reset at `820x980`.
- The focused `Graph` lower `More evidence` continuation now reads as clearer follow-on run cards with one calmer lead excerpt, a bounded continuation trail, and a softer lower `Relations` footer instead of the Stage 352 same-source text wall.
- Focused overview, neighboring focused `Study`, focused `Notes`, and Reader stayed visually aligned with the calmer Stage 352 baseline in the fresh validation set.
- Stage 354 should audit whether focused `Graph` still materially leads after that broader lower-bundle reset.

## Stage 354 Audit Snapshot

- Stage 354 refreshed the localhost narrower-width focused overview, Notes drawer-open empty, Graph, focused `Graph` lower-bundle crops, focused `Study`, answer-shown focused `Study`, and Reader captures at `820x980`.
- The new capture set confirmed that Stage 353 succeeded overall: the focused `Graph` lower continuation now reads materially calmer and less wall-like than the Stage 352 version while the Stage 223 shell correction plus Stage 225 Reader gains remain intact.
- Focused `Graph` still appears to be the clearest remaining narrow mismatch after Stage 354, but the problem has moved up the same rail: the `about` summary, `Mentions` entry, leading grounded clue, and calmer lower bundle still accumulate as a stacked support tower beside Reader.
- Stage 355 should stay on focused `Graph` and simplify that remaining node-detail stack as another visibly broader bundled pass rather than reopening lower-row seam tweaks.

## Stage 355 Implementation Snapshot

- Stage 355 reset the workflow from narrow-only micro-stages into one desktop-first Graph milestone and refreshed the live wide desktop `Graph` and focused/narrow `Graph` captures against `http://127.0.0.1:8000`.
- Wide desktop `Graph` now reads as a visibly different canvas-first workspace: the left side is a lighter utility strip, the canvas is more dominant, and `Node detail` now lives in a docked evidence flow instead of a standing right-side destination card.
- Focused/narrow `Graph` was adapted to the same hierarchy instead of continuing an isolated narrow-only language.
- Stage 356 should audit the full desktop-first Graph milestone with wide desktop surfaces first and focused regression captures second.

## Stage 356 Audit Snapshot

- Stage 356 refreshed the live wide desktop `Home`, `Graph`, `Study`, `Notes`, and `Reader` captures first, then reran focused overview, focused `Graph`, focused `Study`, focused `Notes`, and focused `Reader` regression captures.
- The audit confirmed that the Graph milestone succeeded overall: wide desktop `Graph` is now materially different from the user-provided screenshots and no longer reads like the old small-left-rail plus standing-right-card composition.
- The next honest blocker shifts off `Graph` and onto wide desktop `Study`, which still reads too much like a centered boxed review card inside a mostly empty shell.
- That initial post-audit recommendation was later superseded by the March 18 user-priority reset, which fixed the remaining queue to `Home -> Reader -> Notes` and froze `Study`.

## March 18 Priority Reset Snapshot

- After the Stage 356 audit, the user explicitly reset the remaining order to `Home -> Reader -> Notes` and froze `Study`.
- The March 18, 2026 Stage 356 wide-desktop captures now act as the baseline comparison set for `Home`, `Graph`, `Notes`, and `Reader` against `http://127.0.0.1:8000`.
- `Graph` remains the locked desktop regression baseline unless later work breaks it.
- Future audits must verify the active milestone and regressions, but they do not automatically reorder the queue away from `Home -> Reader -> Notes`.

## Stage 357 Implementation Snapshot

- Stage 357 refreshed the live wide desktop `Home` top view plus dedicated crops for the primary continue/library block and the lower saved-source continuation block, then reran focused overview as the matching regression adaptation against `http://127.0.0.1:8000`.
- Wide desktop `Home` now reads as one active collection workspace instead of the old oversized resume card above a sparse archive tail: shell-level `Search`/`New` stay primary, one stronger lead reopen path anchors the page, nearby resumptions stay visible without dominating, and the denser saved-source library begins much earlier above the fold.
- Focused overview stayed aligned with that new hierarchy instead of preserving the older landing-card language.
- Stage 358 should audit the full Home milestone with wide desktop surfaces first and focused regressions second.

## Stage 358 Audit Snapshot

- Stage 358 refreshed the live wide desktop `Home`, `Graph`, `Study`, `Notes`, and `Reader` captures first, then reran focused overview, focused `Graph`, focused `Study`, focused `Notes`, and focused `Reader` regression captures.
- The audit confirmed that the Home milestone succeeded overall: wide desktop `Home` is now materially different from the earlier user screenshots and no longer reads like a header card plus oversized resume card above a sparse archive tail.
- `Graph` and `Home` now act as the locked desktop regression baselines. `Study` remains frozen for now.
- After the Home closeout, the remaining fixed queue advances to `Reader -> Notes`, and Stage 359 should open the next desktop-first `Reader` milestone without resuming cross-surface micro-hopping.
