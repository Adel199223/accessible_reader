# ExecPlan: Stage 245 Narrower-Width Focused Graph Node-Detail Header Deflation After Stage 244

## Summary
- Use the March 17, 2026 Stage 244 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split balance, Stage 237 focused `Notes` empty-detail deflation, Stage 239 focused `Graph` detail-stack flattening, Stage 241 focused `Study` active-card-stack flattening, and Stage 243 focused `Graph` left-rail deflation intact while shifting to the remaining focused `Graph` support weight.

## Problem Statement
- Stage 243 and Stage 244 corrected the remaining narrower-width focused `Graph` left-rail issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is still focused `Graph`, but it has narrowed to the right `Node detail` lane again.
- At `820x980`, the top of `Node detail` still spends too much height on confirm/reject actions plus the selected-node summary and type framing before `Mentions` begins, which keeps the right support lane slightly taller and more assertive than the calmer narrow benchmark direction wants beside Reader.

## Goals
- Reduce the pre-mentions height and visual weight of the focused `Graph` node-detail header stack at the narrower breakpoint.
- Let `Mentions` begin sooner while keeping confirm/reject actions and selected-node context nearby.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 239 focused `Graph` gains, Stage 241 focused `Study` gains, and Stage 243 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter graph selection, evidence grounding, confirm/reject behavior, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `frontend/src/components/RecallWorkspace.tsx` only if the focused `Graph` node-detail header needs a calmer wrapper or meta hook
  - demote repeated node-detail chrome before hiding any real graph action or evidence affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the right-lane pre-mentions stack
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Graph` node-detail grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Graph` node-detail header spacing, summary framing, and type/meta weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structure expectations aligned if the node-detail header wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Graph` handoffs aligned if the focused `Graph` node-detail header structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Graph` validation capture set before the Stage 246 audit pass if the current Stage 244 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 245 Windows Edge harness to capture narrower-width focused `Graph` and surrounding reader-led states intentionally before the Stage 246 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` node-detail lane no longer reads like a tall pre-mentions header stack beside Reader.
- Reader stays clearly primary while confirm/reject actions, selected-node context, and evidence affordances remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` correction, Stage 239 focused `Graph` correction, Stage 241 focused `Study` correction, and Stage 243 focused `Graph` correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Graph` node-detail header deflation.
