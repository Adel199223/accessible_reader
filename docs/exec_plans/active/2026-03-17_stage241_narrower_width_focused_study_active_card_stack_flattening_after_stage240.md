# ExecPlan: Stage 241 Narrower-Width Focused Study Active-Card Stack Flattening After Stage 240

## Summary
- Use the March 17, 2026 Stage 240 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split balance, Stage 231 focused `Study` rail deflation, Stage 233 focused `Graph` detail-panel deflation, Stage 235 focused `Study` active-card deflation, Stage 237 focused `Notes` empty-detail deflation, and Stage 239 focused `Graph` detail-stack flattening intact while shifting back to the remaining focused `Study` support weight.

## Problem Statement
- Stage 239 and Stage 240 corrected the remaining narrower-width focused `Graph` detail-stack issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is now focused `Study` again, but no longer as a broad queue-rail or full-column problem.
- At `820x980`, the right `Active card` lane still spends too much of its height on the prompt, reveal, and rating stack before supporting evidence and Reader handoffs begin, which makes the support column feel taller and more assertive than the calmer narrow benchmark direction wants beside Reader.

## Goals
- Reduce the pre-evidence height and visual weight of the focused `Study` active-card stack at the narrower breakpoint.
- Let supporting evidence and Reader reopen affordances start sooner while keeping prompt, reveal, and rating actions nearby.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` gains, Stage 235 focused `Study` active-card gains, Stage 237 focused `Notes` gains, and Stage 239 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter study scheduling, answer reveal behavior, grading, source-span evidence behavior, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `frontend/src/components/RecallWorkspace.tsx` only if the focused `Study` active-card stack needs a calmer wrapper or evidence-handoff grouping hook
  - demote repeated prompt/reveal/rating chrome before hiding any real study affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the `Study` pre-evidence stack
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Study` active-card grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Study` prompt, reveal, and rating-stack spacing and weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structure expectations aligned if the active-card stack wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Study` handoffs aligned if the focused `Study` active-card stack structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` validation capture set before the Stage 242 audit pass if the current Stage 240 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 241 Windows Edge harness to capture narrower-width focused `Study` and surrounding reader-led states intentionally before the Stage 242 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` active-card lane no longer reads like a tall pre-evidence stack beside Reader.
- Reader stays clearly primary while prompt, reveal, rating, and evidence affordances remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail correction, Stage 233 focused `Graph` correction, Stage 235 focused `Study` correction, Stage 237 focused `Notes` correction, and Stage 239 focused `Graph` correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Study` active-card stack flattening.
