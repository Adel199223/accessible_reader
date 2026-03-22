# ExecPlan: Stage 479 Home Organizer Header And Direct Board Reset After Stage 478

## Summary
- Reopen `Home` for the next broad Recall-parity slice after the Stage 478 `Graph` timeline-presets audit.
- Shift the next correction away from more card-density or micro-copy passes and into the organizer-to-board relationship itself.
- Make `Home` materially closer to Recall's current organization flow by letting the organizer header own navigation and control state while the right-side board begins sooner as the true working result surface.

## Benchmark Basis
- Official Recall organization guidance still centers the left tag tree as the main control and navigation surface:
  - [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging)
  - [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading position and share cards with a beautiful link preview](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
  - [Release: 15 November 2024 // Exciting Quality of Life Improvements!](https://feedback.getrecall.ai/changelog/release-15-november-2024-exciting-quality-of-life-improvements)
- Those sources emphasize a few things that our current Stage 478 `Home` still only partially matches:
  - the tree header owns filter, sort, collapse, and visibility controls
  - the right side opens as the card/result stage instead of starting beneath a separate top-seam explainer
  - tree rows stay lean enough that the navigation structure remains visible and scannable
- Inference from those sources:
  - because this repo still uses local collection/source metadata instead of a true editable Recall tag model, the best bounded parity move is not to fake nested tag editing or drag-and-drop
  - the highest-leverage honest correction is to compress control ownership into the organizer itself, remove duplicated top-level status chrome, and let the board start higher and cleaner

## Goals
- Keep the existing collection-led organizer model from Stage 475 intact.
- Make the organizer feel more like the primary working navigation surface and less like a settings deck attached to a separate workspace header.
- Let the selected-group board start earlier and read as the direct result stage.
- Preserve the existing organizer-hidden fallback, board/list switching, search, sort, and active-branch continuity.

## Scope

### 1. Retire the heavy Home-wide control seam when the organizer is visible
- Remove or materially deflate the current wide `Home control seam` as a standalone top workbench block in the normal organizer-visible desktop state.
- Keep any remaining seam state minimal and utility-only when it must still exist for empty, error, or organizer-hidden states.
- Do not move shell-level `Search` / `New`; keep those at the app shell.

### 2. Move real control ownership into a tighter organizer header
- Rework the organizer top section so search, lens switching, sorting, direction, view mode, collapse, and hide feel like one compact control header instead of a tall multi-block deck.
- Reduce duplicated descriptive copy and duplicate state chips that already appear elsewhere.
- Keep all current organizer controls and continuity behavior, but regroup them into a more Recall-like compact tree header.

### 3. Simplify active branch preview rows so the tree stays visible
- Slim the active branch child rows so they read more like tree-attached source picks than mini board cards.
- Reduce duplicate metadata in the organizer branch where the same information is already clearer on the right-side board.
- Preserve direct source-open behavior and the existing branch expansion model.

### 4. Let the right board start as the immediate result stage
- Make the selected-group board and filtered-results board start earlier in the vertical flow once the organizer is visible.
- Tighten the board header so it reads as the selected collection result stage rather than as a second explanatory panel.
- Keep the organizer-hidden compact fallback and inline reopen behavior intact.

## Non-Goals
- No generated-content Reader work.
- No `Reflowed`, `Simplified`, or `Summary` changes.
- No Reader generated-view UX, transform logic, placeholders, controls, or mode-routing changes.
- No backend schema or API changes unless a blocker appears.
- No fake nested-tag editing, drag-and-drop tag management, or manual persistent ordering if the local model does not already support it.
- No destructive bulk actions.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Home regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- route/state helpers only if a tiny bounded adjustment becomes necessary

## Validation Plan
- Targeted Vitest:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 479/480 harness pair
- live `GET 200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Expected Evidence
- Stage 479 implementation harness should capture:
  - default wide `Home` top state with the organizer visible
  - organizer header/control deck state
  - a selected collection branch with the slimmer direct source rows
  - the right-side board starting earlier with the simplified board header
- Stage 480 audit harness should refresh:
  - `Home`
  - `Graph`
  - original-only `Reader`
- The audit must state whether the organizer now behaves more like the real control header for the library while the right board opens more directly as the working result surface.

## Exit Criteria
- In the normal organizer-visible desktop state, `Home` no longer reads like a board hidden under a second explanatory top seam.
- Organizer controls feel compact and organizer-owned.
- The active branch reads leaner and less like a duplicate mini board.
- The selected-group board starts higher and reads closer to Recall's current library/result flow.
- `Graph` and original-only `Reader` remain regression-stable.
