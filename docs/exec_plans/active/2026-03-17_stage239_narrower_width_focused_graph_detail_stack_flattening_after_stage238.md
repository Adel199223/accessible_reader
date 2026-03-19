# ExecPlan: Stage 239 Narrower-Width Focused Graph Detail-Stack Flattening After Stage 238

## Summary
- Use the March 17, 2026 Stage 238 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split balance, Stage 231 focused `Study` rail deflation, Stage 233 focused `Graph` detail-panel deflation, Stage 235 focused `Study` active-card deflation, and Stage 237 focused `Notes` empty-detail deflation intact while shifting back to the remaining focused `Graph` support weight.

## Problem Statement
- Stage 237 and Stage 238 corrected the remaining narrower-width focused `Notes` empty-detail issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is now focused `Graph` again, but no longer as a broad panel-weight problem.
- At `820x980`, the right `Node detail` lane still stacks too much selected-node summary chrome before the actual mentions and evidence begin, which makes the support column feel taller and more assertive than the calmer narrow benchmark direction wants beside Reader.

## Goals
- Reduce the pre-mentions height and visual weight of the focused `Graph` detail stack at the narrower breakpoint.
- Let mentions and evidence start sooner while keeping confirm/reject actions and selected-node context nearby.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` detail-panel gains, Stage 235 focused `Study` active-card gains, and Stage 237 focused `Notes` empty-detail gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter graph extraction, confirm/reject behavior, node selection, evidence grounding, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `frontend/src/components/RecallWorkspace.tsx` only if the focused `Graph` detail stack needs a calmer summary hook
  - demote repeated selected-node chrome before hiding any real graph action or evidence affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the `Graph` pre-mentions stack
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Graph` selected-node grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Graph` selected-node stack spacing, helper framing, and pre-mentions card weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structure expectations aligned if the detail-stack wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Graph` handoffs aligned if the focused `Graph` detail stack structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Graph` validation capture set before the Stage 240 audit pass if the current Stage 238 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 239 Windows Edge harness to capture narrower-width focused `Graph` and surrounding reader-led states intentionally before the Stage 240 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` detail lane no longer reads like a tall pre-mentions support stack beside Reader.
- Reader stays clearly primary while selected-node context, confirm/reject actions, and evidence affordances remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail correction, Stage 233 focused `Graph` correction, Stage 235 focused `Study` correction, and Stage 237 focused `Notes` correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Graph` detail-stack flattening.
