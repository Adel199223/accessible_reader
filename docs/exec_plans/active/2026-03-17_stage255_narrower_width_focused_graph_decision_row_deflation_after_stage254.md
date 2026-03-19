# ExecPlan: Stage 255 Narrower-Width Focused Graph Decision Row Deflation After Stage 254

## Summary
- Use the March 17, 2026 Stage 254 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch surfaces because the fresh audit says the focused `Study` left queue-utility-row correction succeeded overall and the next remaining narrower-width mismatch is now the focused `Graph` `Node detail` decision row and header stack.

## Problem Statement
- Stage 253 and Stage 254 reduced the focused `Study` left rail without destabilizing the neighboring focused surfaces.
- At `820x980`, focused `Graph` now stands out again beside Reader.
- The main offender is now localized: the `Confirm` / `Reject` decision row plus the selected-node header stack still read a little too contrast-heavy and tall before `Mentions` begins.

## Goals
- Reduce the visual and structural weight of the focused `Graph` `Node detail` decision row and header stack at the narrower breakpoint.
- Keep confirm/reject access, node identity, and evidence flow intact while letting Reader stay clearly primary.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 247 focused `Study` right-lane gains, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, and Stage 253 focused `Study` left-rail gains.

## Non-Goals
- Do not change backend APIs, graph extraction behavior, confirm/reject semantics, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.
- Do not remove the ability to review mentions, relations, or Reader handoffs from focused `Graph`.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the decision row needs a lighter grouping wrapper
  - flatten the decision row and selected-node header chrome before shrinking any real confirm/reject affordance
  - keep the Reader column width and the calmer left graph rail stable while reducing the right lane's perceived prominence
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Graph` detail-header grouping only if a small wrapper or class hook is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Graph` decision-row contrast, header spacing, and selected-node summary weight at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structure expectations aligned if the detail-header wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Graph` handoffs aligned if the focused `Graph` detail-header structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Graph` validation capture set before the Stage 256 audit pass if the current Stage 254 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 255 Windows Edge harness to capture narrower-width focused `Graph` and surrounding reader-led states intentionally before the Stage 256 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Node detail` decision row no longer reads louder than the neighboring focused rails and panels beside Reader.
- Reader stays clearly primary while confirm/reject actions, node identity, and evidence flow remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 251 focused overview gains, and Stage 253 focused `Study` left-rail gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Graph` follow-up.
