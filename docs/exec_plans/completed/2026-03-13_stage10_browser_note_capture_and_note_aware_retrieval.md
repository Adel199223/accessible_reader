# ExecPlan: Stage 10 Browser Note Capture and Note-Aware Retrieval

## Summary
- Extend Stage 9 notes into the MV3 browser companion without widening v1 scope into full web clipping or free-form spans.
- Allow manual note capture only when the companion can match the current public page to an existing saved source document.
- Surface note hits in Recall retrieval and browser-context summaries while keeping graph/study/export/apply promotion deferred.
- Close the remaining live-validation gap with a debug-only extension harness path plus a manual Edge unpacked-extension smoke before moving on.
- Record the approved product correction that Reader must adapt to the Recall-first shell immediately after Stage 10 closes.

## Public Interfaces
- Extend the browser companion flow with a manual note-capture action for exact saved public-page matches.
- Add any backend request/response types needed to accept browser note capture against existing saved source documents.
- Extend Recall retrieval and browser-context responses so note hits can appear alongside chunks, graph nodes, and study cards.

### Concrete Stage-10 Contract
- Extend `BrowserContextResponse` with optional exact-match saved-page metadata so the popup/content surfaces can offer note capture even when automatic prompting stays quiet.
- Add a bounded browser note-capture route that accepts only:
  - the current public `page_url`
  - the current selected text
  - optional plain-text note body
- Keep browser note anchors sentence-based by resolving the live-page selection back onto the stored `reflowed/default` variant for the matched saved webpage source.
- Extend `RecallRetrievalHit` with:
  - `hit_type = "note"`
  - optional `note_id`
  - optional `note_anchor`
  so Recall search results and browser-context hit cards can reopen Reader at the anchored sentence range.

## Implementation Changes
- Browser companion:
  - detect when the current page exactly matches a saved public webpage source already in Recall
  - expose a manual note-capture affordance in the popup/content flow only for that bounded case
  - send sentence-range note anchors or equivalent deterministic anchors back to the existing note-storage layer
- Backend/shared storage:
  - reuse Stage 9 note entities where possible
  - avoid introducing note tags, notebooks, free-form spans, or note export/apply behavior in this stage
- Retrieval/browser-context:
  - add note hits to Recall retrieval ranking and browser-context summaries in a bounded, source-linked way
  - keep note hits clearly distinguishable from chunk, graph, and study evidence

### Concrete Implementation Path
- Backend:
  - add canonical-URL exact-match lookup for saved `source_type = web` documents
  - add server-side selection-to-sentence-range resolution over stored `reflowed/default` blocks, rejecting ambiguous or unmatched selections
  - fold note FTS matches into Recall retrieval scoring without introducing note embeddings or export/apply behavior yet
- Extension:
  - keep note capture in the background worker so popup/content stay thin
  - offer quick capture from the in-page panel and optional note text from the popup
  - reopen Reader with `sentenceStart`/`sentenceEnd` when a hit or newly saved note includes an anchor
- Frontend Recall:
  - surface `note` retrieval hits in the main Recall search results
  - route note-hit selection into the existing Notes section and preserve `Open in Reader` anchor handoff
- Validation harness:
  - add a debug-only extension page and runtime inspection path that reuse the existing background state instead of inventing parallel backend behavior
  - keep debug artifacts out of the standard production extension build

## Test Plan
- Backend:
  - bounded browser note-capture request validation
  - note-aware retrieval coverage
  - browser-context note-hit coverage
- Frontend/extension:
  - companion UI only offers note capture for exact saved public-page matches
  - note capture lands in Recall notes and opens back into Reader correctly
  - existing Reader, Recall, graph, study, export, and Stage 9 note tests remain green
- Validation:
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - extension `npm test -- --run`
  - extension `npm run build`
  - extension `npm run build:debug`
  - one live browser-companion smoke pass for exact-match note capture and note-aware resurfacing

## Assumptions
- Stage 10 starts from branch `codex/stage8-closeout-doc-sync` after the Stage 9 closeout.
- Browser note capture remains limited to exact saved public-page matches in this slice.
- Tags, notebooks, portable apply, manual graph/study promotion, and generic web clipping remain deferred.
- Browser note capture resolves to the smallest deterministic sentence range inside one stored block; when the selected text cannot be matched safely, the backend returns a bounded validation error instead of guessing.
- After Stage 10 closes, the next immediate ExecPlan is a bounded Reader shell convergence slice so Reader adopts Recall structure and language without regressing reading behavior.

## Progress
- Implemented:
  - backend exact saved-page matching, bounded browser note capture, and note-aware retrieval/browser-context hits
  - Recall search support for `note` hits with anchored handoff into the Notes section
  - extension popup/content affordances for exact-match browser note capture plus anchored Reader handoff
  - a debug-only extension build with `debug.html`, gated debug inspection messages, and a repo-owned Edge Playwright harness path
- Validation status:
  - backend `pytest` and app import check are green
  - frontend tests, lint, and build are green
  - extension tests and build are green
  - extension `npm run build:debug` is green
  - the repo-owned Edge harness now validates popup refresh, debug-page inspection, note capture, Recall note surfacing, and anchored Reader reopen
- Closeout:
  - the live validation gap is closed through the debug build plus the real Edge unpacked-extension harness pass
  - the next active ExecPlan is the bounded Reader shell convergence slice before Stage 11
