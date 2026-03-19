# ExecPlan: Stage 231 Narrower-Width Focused Study Queue Rail Deflation After Stage 230

## Summary
- Use the March 17, 2026 Stage 230 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, and Stage 229 focused split rebalancing intact while shifting to the remaining focused `Study` queue rail.

## Problem Statement
- Stage 229 and Stage 230 corrected the broader narrower-width focused split so `Notes` and `Graph` now read more clearly reader-led.
- The most visible remaining narrower-width issue is now focused `Study`.
- At `820x980`, the left `Study queue` rail still reads taller and more assertive than the calmer benchmark direction wants beside the Reader and active card.

## Goals
- Reduce the height and visual weight of the focused `Study` queue rail at the narrower breakpoint.
- Keep the next-card context, queue access, and refresh affordances nearby without letting that rail compete with Reader.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, and Stage 229 split balance.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter study scheduling, rating behavior, card generation, source-span evidence behavior, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the queue rail needs a lighter grouping wrapper
  - demote repeated queue summary chrome before hiding any real queue or refresh affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the queue rail footprint
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Study` queue-rail grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Study` queue-rail width, spacing, and summary-card weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structure expectations aligned if the queue rail wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Study` handoffs aligned if the focused `Study` wrapper structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` validation capture set before the Stage 232 audit pass if the current Stage 230 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 231 Windows Edge harness to capture narrower-width focused `Study` and surrounding reader-led states intentionally before the Stage 232 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` queue rail no longer reads like a tall co-equal support lane beside Reader and the active card.
- Reader stays clearly primary while the next-card context, queue access, and study actions remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, and Stage 229 split balance remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Study` rail deflation.
