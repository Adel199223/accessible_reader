# ExecPlan: Stage 265 Narrower-Width Focused Graph Node Detail Pre-Mentions Shell Deflation After Stage 264

## Summary
- Use the March 17, 2026 Stage 264 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay in focused work at `820x980`, but switch the active surface back to focused `Graph` because Stage 263 succeeded overall and the next highest-leverage mismatch is now localized in the right `Node detail` lane.

## Problem Statement
- Stage 263 successfully reduced the drawer-open empty `Notes` detail panel into a compact support state without destabilizing neighboring focused surfaces.
- At `820x980`, focused `Graph` now stands out more clearly as the remaining narrow mismatch.
- The `Node detail` lane still spends too much top-of-panel height on review copy, decision chrome, and selected-node summary shell before grounded `Mentions` and `Relations` begin, so the right lane still feels heavier than the neighboring focused surfaces beside Reader.

## Goals
- Reduce the visual and structural weight of the focused `Graph` `Node detail` pre-`Mentions` shell at the narrower breakpoint.
- Keep the `Node detail` destination obvious while letting grounded mentions and relation evidence begin sooner in the first viewport.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, Stage 261 focused `Notes` drawer-open browse-empty gains, and Stage 263 focused `Notes` drawer-open empty-detail gains.

## Non-Goals
- Do not change backend APIs, graph extraction logic, confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, Reader handoffs, confirm/reject controls, or grounded mentions/relations.
- Do not widen this pass into another full focused split rebalance or a broader Graph browse-mode rewrite.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the focused `Node detail` lane needs a calmer narrow-only hook
  - reduce helper copy, decision-row framing, and selected-node summary shell before changing wider layout behavior
  - keep the Stage 255 decision-row gains stable while making the pre-`Mentions` stack feel shorter and more secondary
- `frontend/src/components/RecallWorkspace.tsx`
  - add a narrow-only hook around the focused `Graph` selected-node shell only if needed to support a calmer pre-`Mentions` treatment
- `frontend/src/index.css`
  - tighten focused `Graph` `Node detail` pre-`Mentions` spacing, helper copy, and selected-node shell framing at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if the pre-`Mentions` hook changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and graph handoff expectations aligned if the focused `Node detail` structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Graph` validation capture set before the Stage 266 audit pass if the current Stage 264 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 265 Windows Edge harness to capture narrower-width focused `Graph` `Node detail` behavior intentionally before the Stage 266 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Node detail` lane no longer spends unnecessary top-of-panel height on review copy, decision chrome, and selected-node summary shell before grounded mentions begin.
- Graph confirm/reject actions, grounded mentions/relations, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, Stage 261 drawer-open browse-empty gains, and Stage 263 drawer-open empty-detail gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Graph` follow-up.
