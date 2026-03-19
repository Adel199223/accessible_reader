# ExecPlan: Stage 253 Narrower-Width Focused Study Queue Utility Row Flattening After Stage 252

## Summary
- Use the March 17, 2026 Stage 252 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch surfaces because the fresh audit says the focused overview `Home`-rail correction succeeded overall and the next remaining narrower-width mismatch is now the focused `Study` left queue utility row.

## Problem Statement
- Stage 251 and Stage 252 reduced the focused overview `Home` rail without destabilizing the neighboring focused surfaces.
- At `820x980`, focused `Study` still lets the left queue rail read louder than the matching `Notes` and `Graph` rails.
- The main offender is now localized: the `Queue` / `Refresh` utility row plus the highlighted refresh action and summary card still feel too tall and too contrast-heavy beside Reader and the calmer right lane.

## Goals
- Reduce the visual and structural weight of the focused `Study` left queue utility row at the narrower breakpoint.
- Keep queue access, refresh, and next-card context intact while letting Reader stay clearly primary.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 245 focused `Graph` gains, Stage 247 focused `Study` right-lane gains, Stage 249 focused `Notes` gains, and Stage 251 focused overview gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter study scheduling, rating behavior, card generation, source-span evidence behavior, or source-tab destinations.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the queue utility row needs a lighter grouping wrapper
  - flatten the queue utility row and its highlighted action before shrinking any actual queue or refresh affordance
  - keep the Reader column width and the calmer focused `Study` right lane stable while reducing the left rail's perceived prominence
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Study` left-rail grouping only if a small wrapper or label move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Study` left-rail spacing, utility-row contrast, and summary-card weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structure expectations aligned if the queue utility row wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Study` handoffs aligned if the focused `Study` left-rail wrapper structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` validation capture set before the Stage 254 audit pass if the current Stage 252 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 253 Windows Edge harness to capture narrower-width focused `Study` and surrounding reader-led states intentionally before the Stage 254 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` left queue utility row no longer reads louder than the neighboring focused `Notes` and `Graph` rails.
- Reader stays clearly primary while queue access, refresh, and study actions remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 247 focused `Study` right-lane gains, and Stage 251 focused overview gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Study` left-rail follow-up.
