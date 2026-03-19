# ExecPlan: Stage 235 Narrower-Width Focused Study Active-Card Column Deflation After Stage 234

## Summary
- Use the March 17, 2026 Stage 234 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split rebalancing, Stage 231 focused `Study` rail deflation, and Stage 233 focused `Graph` detail-panel deflation intact while shifting to the remaining focused `Study` support weight.

## Problem Statement
- Stage 233 and Stage 234 corrected the remaining narrower-width focused `Graph` detail-panel issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is now focused `Study` again, but no longer in the left queue rail.
- At `820x980`, the right `Active card` column still reads taller and more assertive than the calmer benchmark direction wants beside Reader and the now-lighter `Study` queue rail.

## Goals
- Reduce the height and visual weight of the focused `Study` active-card column at the narrower breakpoint.
- Keep reveal, rating, prompt context, and evidence affordances nearby without letting the active-card column compete with Reader.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, and Stage 233 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter study scheduling, answer reveal behavior, grading, source-span evidence behavior, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the focused `Study` active-card column needs a lighter grouping wrapper or summary hook
  - demote repeated active-card chrome before hiding any real reveal, rating, or Reader affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the `Study` active-card footprint
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Study` active-card grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Study` active-card-column spacing, stacked prompt framing, and button weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structure expectations aligned if the active-card wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Study` handoffs aligned if the focused `Study` active-card wrapper structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` validation capture set before the Stage 236 audit pass if the current Stage 234 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 235 Windows Edge harness to capture narrower-width focused `Study` and surrounding reader-led states intentionally before the Stage 236 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` active-card column no longer reads like a tall co-equal support lane beside Reader and the lighter queue rail.
- Reader stays clearly primary while reveal, rating, prompt context, and evidence affordances remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail correction, and Stage 233 focused `Graph` correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Study` active-card deflation.
