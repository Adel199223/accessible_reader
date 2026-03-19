# ExecPlan: Stage 267 Bundled Narrower-Width Focused Graph Node Detail Lane Deflation After Stage 266

## Summary
- Use the March 17, 2026 Stage 266 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Graph` at `820x980`, but switch from one-delta micro-passes into bundled dominant-surface mode because Stage 265 succeeded overall and the remaining mismatch is now localized inside the `Node detail` lane.

## Problem Statement
- Stage 265 successfully shortened the focused `Graph` pre-`Mentions` shell without destabilizing neighboring focused surfaces.
- At `820x980`, focused `Graph` still reads slightly heavier than the neighboring focused surfaces because the `Node detail` lane continues to stack as separate mini-zones: a heading/action cluster, a selected-node glance shell, and then the first grounded evidence card.
- That residual structure still makes the right lane feel more like a co-equal destination than a compact validation rail beside Reader.

## Goals
- Batch 2-3 tightly related narrow-only focused `Graph` lane reductions in one pass instead of another single-delta correction.
- Make the `Node detail` heading/actions, selected-node glance, and first grounded evidence handoff read like one calmer utility flow.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, Stage 261 focused `Notes` drawer-open browse-empty gains, Stage 263 focused `Notes` drawer-open empty-detail gains, and Stage 265 focused `Graph` pre-`Mentions` shell gains.

## Non-Goals
- Do not change backend APIs, graph extraction logic, confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, Reader handoffs, confirm/reject controls, selected-node context, or grounded mentions/relations.
- Do not widen this pass into another full focused split rebalance, a Graph browse-mode rewrite, or a broader shell redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the focused `Node detail` lane needs new narrow-only hooks
  - treat the remaining mismatch as one lane-level problem, not three unrelated micro-issues
  - keep the Stage 255 decision-row gains and Stage 265 pre-`Mentions` gains stable while making the whole right lane feel calmer
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine narrow-only hooks around the focused `Graph` detail header, selected-node glance shell, and first grounded evidence block only if needed
- `frontend/src/index.css`
  - flatten the focused `Graph` detail header/action grouping at the targeted breakpoint
  - reduce the selected-node glance shell into a tighter one-glance support block
  - tighten the transition between the selected-node shell and the first `Mentions` evidence card so the lane reads more continuously
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if the bundled lane hooks change
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and graph handoff expectations aligned if the focused `Node detail` structure changes
- repo-owned Edge harness
  - add a bundled narrower-width focused `Graph` validation capture set before the Stage 268 audit pass if the current Stage 266 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 267 Windows Edge harness to capture the bundled focused `Graph` lane treatment intentionally before the Stage 268 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Node detail` lane no longer reads like separate stacked mini-panels before grounded `Mentions` begin.
- Focused `Graph` confirm/reject actions, selected-node context, grounded mentions/relations, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, Stage 261 drawer-open browse-empty gains, Stage 263 drawer-open empty-detail gains, and Stage 265 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled lane pass or whether another surface now becomes the clearer follow-up.
