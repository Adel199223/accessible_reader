# ExecPlan: Stage 353 Bundled Narrower-Width Focused Graph Follow-On Text-Wall Reset After Stage 352

## Summary
- Use the March 18, 2026 Stage 352 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep bundled dominant-surface mode on focused `Graph` at `820x980`, because Stage 351 succeeded overall and materially widened/calmed the `Node detail` rail, but the lower continuation still reads like a dense same-source text wall beside Reader.
- Keep this step visibly broader again: Stage 353 should reset the lower continuation reading pattern itself instead of trimming one more micro seam.

## Problem Statement
- Stage 351 materially improved focused `Graph` by widening the rail, shrinking the left Graph rail, stacking the top utility seam more clearly, and making the leading grounded clue more readable.
- The fresh Stage 352 capture set shows that the remaining mismatch is now lower in the same surface: the follow-on same-source continuation still collapses into a long stacked text wall beneath the improved leading card.
- Reader should stay primary at `820x980`, but focused `Graph` still needs the lower continuation to read like grouped support blocks instead of a dense evidence ledger.
- Because the user explicitly asked for significant, visible progress per stage, this pass should stay broad enough that the lower half looks obviously different at a glance.

## Goals
- Keep focused `Graph` subordinate to Reader while making the lower `More evidence` continuation easier to scan at `820x980`.
- Treat the follow-on run header, repeated same-source rows, and lower relation/footer continuation as one bundled readability reset.
- Produce another clearly noticeable visual change at `820x980`, not a hidden density-only edit.
- Preserve the calmer shell, Stage 223 shell correction, Stage 225 Reader gains, focused overview gains through Stage 251, focused `Notes` gains through Stage 263, focused `Study` gains through Stage 349, focused `Graph` gains through Stage 351, and current product-behavior constraints.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, `Show` / `Reader` handoffs, or focused `Relations` access from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the lower follow-on bundle needs cleaner localized grouping hooks for a true text-wall reset
  - keep this bundled: avoid splitting follow-on run cards, repeated same-source rows, and lower footer treatment into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the lower continuation grouping needs cleaner targeted selectors
- `frontend/src/index.css`
  - preserve the Stage 351 right-rail width and top-shell readability gains
  - make the lower continuation read like grouped follow-on support blocks instead of a long dense text wall
  - keep the lower `Relations` footer subordinate to Reader and clearly attached to the calmer continuation flow
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized hook is added
- repo-owned Edge harness
  - reuse the Stage 351 Graph top and right-rail crops unless one adjusted lower-half crop better captures the bundled continuation reset

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 353/354 Windows Edge harness files
- run the Stage 353 Windows Edge validation harness against the live localhost app before the Stage 354 audit

## Exit Criteria
- At `820x980`, the focused `Graph` lower continuation no longer reads like a stacked same-source text wall beneath the improved leading clue.
- Stage 353 makes another clearly noticeable focused `Graph` change at a glance, not just a hidden seam reduction.
- Focused `Graph` evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide honestly whether focused `Graph` still materially leads or whether another surface becomes the clearer next blocker.
