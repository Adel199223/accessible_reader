# ExecPlan: Stage 243 Narrower-Width Focused Graph Left-Rail Deflation After Stage 242

## Summary
- Use the March 17, 2026 Stage 242 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split balance, Stage 231 focused `Study` rail deflation, Stage 237 focused `Notes` empty-detail deflation, Stage 239 focused `Graph` detail-stack flattening, and Stage 241 focused `Study` active-card-stack flattening intact while shifting back to the remaining focused `Graph` support weight.

## Problem Statement
- Stage 241 and Stage 242 corrected the remaining narrower-width focused `Study` active-card stack issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is now focused `Graph` again, but no longer mainly in the right `Node detail` stack.
- At `820x980`, the left focused `Graph` rail still spends too much height on intro copy, browse utility, and selected-node summary chrome before the split settles into live reading plus node evidence, which makes the surface feel more evenly tri-column than the calmer narrow benchmark direction wants.

## Goals
- Reduce the height and visual weight of the focused `Graph` left rail at the narrower breakpoint.
- Keep Browse access and selected-node context nearby without letting the left rail compete with Reader and `Node detail`.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 237 focused `Notes` gains, Stage 239 focused `Graph` gains, and Stage 241 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter graph selection, evidence grounding, confirm/reject behavior, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `frontend/src/components/RecallWorkspace.tsx` only if the focused `Graph` rail needs a calmer grouping hook
  - demote repeated focused-Graph rail chrome before hiding any real graph utility or selected-node context
  - keep the Reader column width and Stage 229 split balance stable while reducing the left rail footprint
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Graph` rail grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Graph` rail spacing, repeated copy, and selected-node summary weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structure expectations aligned if the rail wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Graph` handoffs aligned if the focused `Graph` rail structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Graph` validation capture set before the Stage 244 audit pass if the current Stage 242 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 243 Windows Edge harness to capture narrower-width focused `Graph` and surrounding reader-led states intentionally before the Stage 244 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` left rail no longer reads like a tall co-equal support lane beside Reader and `Node detail`.
- Reader stays clearly primary while Browse access, selected-node context, and graph handoffs remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` correction, Stage 237 focused `Notes` correction, Stage 239 focused `Graph` correction, and Stage 241 focused `Study` correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Graph` left-rail deflation.
