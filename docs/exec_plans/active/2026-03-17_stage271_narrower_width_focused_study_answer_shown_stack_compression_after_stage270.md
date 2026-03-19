# ExecPlan: Stage 271 Narrower-Width Focused Study Answer-Shown Stack Compression After Stage 270

## Summary
- Use the March 17, 2026 Stage 270 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Study` at `820x980`, because Stage 269 succeeded overall but the answer-shown right-lane stack still remains the lead mismatch.

## Problem Statement
- Stage 269 successfully fused the default focused `Study` right lane into a calmer support flow without destabilizing neighboring focused surfaces.
- At `820x980`, the answer-shown focused `Study` state still gets too tall beside Reader.
- Once the answer is visible, the rating row plus the supporting evidence section still stack as a long second destination beneath the revealed answer, so the right lane regains too much weight in that state.

## Goals
- Reduce the answer-shown focused `Study` right-lane height at the narrower breakpoint.
- Make the rating controls and supporting evidence feel more like a compact continuation beneath the revealed answer.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 267 focused `Graph` gains, and Stage 269 focused `Study` fusion gains.

## Non-Goals
- Do not change backend APIs, study-card generation, reveal/rating semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Study` flow, answer reveal controls, rating actions, source evidence, or Reader handoffs.
- Do not widen this pass into another full right-lane redesign, a Study browse-mode rewrite, or a broader shell change.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the answer-shown state needs a dedicated narrow-only hook
  - keep the Stage 269 fusion gains stable and target only the answer-shown stack height
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine narrow-only hooks around the answer-shown focused `Study` stack only if needed
- `frontend/src/index.css`
  - compress the focused `Study` answer-shown rating row and supporting evidence stack at the targeted breakpoint
  - reduce unnecessary vertical seams once the answer is visible, while keeping actions obvious
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if the answer-shown hook changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study handoff expectations aligned if the answer-shown structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` answer-shown validation capture set before the Stage 272 audit if the current Stage 270 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 271 Windows Edge harness to capture the answer-shown focused `Study` stack intentionally before the Stage 272 audit

## Exit Criteria
- At the targeted narrower desktop width, the answer-shown focused `Study` right lane no longer regains excessive height beside Reader.
- Focused `Study` reveal, rating, supporting evidence, grounding, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 267 focused `Graph` gains, and Stage 269 focused `Study` gains remain intact.
- The next audit can decide whether focused `Study` still materially leads after the answer-shown compression or whether another surface now becomes the clearer follow-up.
