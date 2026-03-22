# ExecPlan: Stage 475 Home Collection Lens And Organizer Model Reset After Stage 474

## Summary
- Reopen `Home` for one broader Recall-parity correction centered on the organizer model, not another spacing-only trim.
- The current organizer still behaves as a static recency bucket list (`Today`, `This week`, `Earlier`) with a tag-like visual treatment layered on top.
- Recall's current benchmark direction is a left collection/tag panel that actually drives browsing, filtering, and card organization. We do not yet have user-defined tags in this repo, so this pass will use a bounded local-first inference: move `Home` to a collection-lens organizer that can pivot between metadata-driven groupings instead of staying recency-only.
- `Reader` remains locked to original-only cosmetic regression coverage. Do not change `Reflowed`, `Simplified`, or `Summary` workflows, generated-view UX, transform logic, placeholders, controls, or mode-routing.

## Implementation Scope
- Add an organizer lens model for wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Replace the current recency-only organizer default with a clearer collection-led default that groups saved sources by local metadata:
  - `Collections` lens: `Web`, `Captures`, and `Documents`
  - `Recent` lens: retain `Today`, `This week`, and `Earlier`
- Keep the organizer rail as the owner of search, sort, direction, view, collapse, hide, and now lens switching.
- Make the selected group heading and right-side board reflect the active lens more directly so `Home` reads like one organizer-driven workbench rather than a board plus a separate time bucket browser.
- Preserve current local-first behavior and existing source handoffs:
  - open source from organizer rows
  - open source from board rows/cards
  - compact organizer-hidden control deck
  - board/list switching
  - sort/direction switching
  - active source continuity
- Keep the broader board hierarchy calmer while trimming duplicated explanatory copy where the new organizer lens already explains the active state.

## Public Interfaces / Types
- Extend the `RecallWorkspaceContinuityState.library` shape in `frontend/src/lib/appRoute.ts` with a new organizer lens field.
- No backend contract changes.
- No parsing, storage, or API schema changes.

## Test Plan
- Update `frontend/src/lib/appRoute.test.ts` for the new continuity default.
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to cover:
  - default collection-led organizer state
  - lens switching between `Collections` and `Recent`
  - preserved organizer-hidden compact controls
  - selected board continuity after lens changes
- Keep `frontend/src/App.test.tsx` aligned with the new Home organizer model so active source handoffs, view switching, and organizer hiding still hold.
- Add a new Windows Edge harness pair:
  - Stage 475 implementation harness: wide default `Collections` organizer state, switched `Recent` state, and compact-controls hidden-organizer state
  - Stage 476 audit harness: refreshed `Home`, `Graph`, and original-only `Reader` captures with the new organizer model in place

## Validation
- targeted Vitest for `appRoute.test.ts`, `RecallWorkspace.stage37.test.tsx`, and `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 475/476 harness pair
- live `200` checks for `http://127.0.0.1:8000/recall` and `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Benchmark Notes
- Primary benchmark direction: Recall's current tagging / left-panel organization guidance and recent changelog direction around stronger organization controls.
- Inference from sources: because this repo still lacks user-defined tags, the closest bounded parity step is a metadata-driven collection lens that makes the organizer genuinely drive browsing instead of only styling recency buckets to resemble tags.
