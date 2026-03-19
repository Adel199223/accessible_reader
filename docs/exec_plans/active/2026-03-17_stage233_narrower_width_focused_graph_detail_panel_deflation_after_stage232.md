# ExecPlan: Stage 233 Narrower-Width Focused Graph Detail Panel Deflation After Stage 232

## Summary
- Use the March 17, 2026 Stage 232 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split rebalancing, and Stage 231 focused `Study` rail deflation intact while shifting to the remaining focused `Graph` support weight.

## Problem Statement
- Stage 231 and Stage 232 corrected the remaining narrower-width focused `Study` rail issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is now focused `Graph`.
- At `820x980`, the right `Node detail` panel still reads taller and more assertive than the calmer benchmark direction wants beside the Reader and the slimmer left graph rail.

## Goals
- Reduce the height and visual weight of the focused `Graph` detail panel at the narrower breakpoint.
- Keep confirm/reject actions, selected-node context, and Reader handoffs nearby without letting the detail panel compete with Reader.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, and Stage 231 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter graph extraction, confirm/reject behavior, evidence grounding, node/edge sorting, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the focused `Graph` detail panel needs a lighter grouping wrapper or summary hook
  - the existing focused-detail hook `recall-graph-focused-detail` already gives a narrow-only target; keep this pass CSS-only unless button-label or summary-copy shortening becomes necessary after the first screenshot pass
  - demote repeated detail chrome before hiding any real confirm/reject or Reader affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the `Graph` detail footprint
  - first target the narrow focused `Node detail` toolbar/action row plus the `Selected node` stage card before tightening the lower mentions/relations sections
  - prefer shorter visible action labels with preserved accessible names if the buttons need to stay on one calmer utility row at the narrow breakpoint
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Graph` detail grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Graph` detail-panel spacing, copy weight, and stacked summary chrome at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structure expectations aligned if the detail wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Graph` handoffs aligned if the focused `Graph` detail wrapper structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Graph` validation capture set before the Stage 234 audit pass if the current Stage 232 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 233 Windows Edge harness to capture narrower-width focused `Graph` and surrounding reader-led states intentionally before the Stage 234 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` detail panel no longer reads like a tall co-equal support lane beside Reader and the lighter graph rail.
- Reader stays clearly primary while confirm/reject actions, node context, and Reader handoffs remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, and Stage 231 focused `Study` correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Graph` detail deflation.
