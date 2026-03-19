# ExecPlan: Stage 237 Narrower-Width Focused Notes Empty-Detail Panel Deflation After Stage 236

## Summary
- Use the March 17, 2026 Stage 236 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, Stage 227 focused-source strip compression, Stage 229 focused split balance, Stage 231 focused `Study` rail deflation, Stage 233 focused `Graph` detail-panel deflation, and Stage 235 focused `Study` active-card deflation intact while shifting to the remaining focused `Notes` support weight.

## Problem Statement
- Stage 235 and Stage 236 corrected the remaining narrower-width focused `Study` active-card issue without destabilizing the neighboring focused surfaces.
- The most visible remaining narrower-width issue is now focused `Notes`, but not in the left browse rail.
- At `820x980`, the right `Note detail` panel still spends a full support column on a mostly empty state when no note is active, which reads like a blank co-equal lane beside Reader instead of a light secondary support surface.

## Goals
- Reduce the height and visual weight of the focused `Notes` empty-detail panel at the narrower breakpoint.
- Keep note browsing, anchored-note handoffs, and Reader reopen affordances obvious without letting the empty detail column compete with Reader.
- Preserve the Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` gains, and Stage 235 focused `Study` active-card gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter note storage, note editing, deletion, promotion behavior, note selection semantics, or source-tab destinations.
- Do not widen this pass into a broad focused `Notes` redesign or a cross-surface rewrite.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `frontend/src/components/RecallWorkspace.tsx` only if the focused `Notes` empty state needs a calmer wrapper or tighter copy grouping
  - demote blank-state chrome before hiding any real note action or Reader affordance
  - keep the Reader column width and Stage 229 split balance stable while reducing the `Notes` empty-detail footprint
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Notes` empty-detail grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Notes` empty-detail spacing, helper framing, and empty-state weight at the targeted breakpoint while preserving wider layouts and active-note states
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Notes` structure expectations aligned if the empty-detail wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Notes` handoffs aligned if the focused `Notes` empty-detail wrapper structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Notes` validation capture set before the Stage 238 audit pass if the current Stage 236 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 237 Windows Edge harness to capture narrower-width focused `Notes` and surrounding reader-led states intentionally before the Stage 238 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Notes` empty-detail panel no longer reads like a blank co-equal support lane beside Reader.
- Reader stays clearly primary while note browsing, anchored-note handoffs, and Reader reopen affordances remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail correction, Stage 233 focused `Graph` correction, and Stage 235 focused `Study` active-card correction remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the `Notes` empty-detail deflation.
