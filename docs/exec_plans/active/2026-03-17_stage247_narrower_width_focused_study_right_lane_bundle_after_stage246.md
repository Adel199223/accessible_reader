# ExecPlan: Stage 247 Narrower-Width Focused Study Right-Lane Bundle After Stage 246

## Summary
- Use the March 17, 2026 Stage 246 audit as the handoff point for the next bounded benchmark slice.
- Stay on focused `Study` in bundled dominant-surface mode because the remaining narrower-width mismatch has returned to the same localized right lane after the focused `Graph` correction.

## Problem Statement
- Stage 245 and Stage 246 confirmed that the focused `Graph` node-detail header no longer leads the narrower-width benchmark mismatch.
- At `820x980`, focused `Study` still stands out because the right `Active card` lane spends too much height on the top glance/meta stack, the standalone prompt and reveal framing, the supporting-evidence helper/actions, and the separate grounding card before the lane settles into calmer evidence.
- Focused `Study` has already required multiple single-delta passes at this breakpoint, so the remaining issue is now localized enough to batch 2-3 tightly related right-lane reductions before the next full benchmark audit.

## Goals
- Reduce vertical chrome in the focused `Study` right lane so Reader stays clearly primary at the narrower breakpoint.
- Batch the remaining right-lane reductions into one coherent pass: active-card header/meta deflation, prompt/reveal block compression, and supporting-evidence plus grounding-excerpt framing compression.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 241 focused `Study` gains, and Stage 245 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not change study scheduling, grading, evidence selection, or Reader handoff behavior.
- Do not widen this pass into `Home`, `Graph`, `Notes`, `Reader`, or another broad focused-split rewrite.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with only small markup grouping changes in `frontend/src/components/RecallWorkspace.tsx` if the focused `Study` right lane needs calmer wrappers or shared hooks
  - keep the queue rail and Reader column stable while reducing the stacked chrome inside the right lane
  - batch related reductions together instead of reopening one more single-card micro-pass
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Study` right-lane grouping only if a small wrapper or copy move is needed to compress the active-card glance, prompt/reveal block, and supporting-evidence/grounding stack coherently
- `frontend/src/index.css`
  - tighten the focused `Study` right-lane spacing, card framing, helper copy, and action density at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structure expectations aligned if the right-lane grouping changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Study` handoffs aligned if the focused `Study` right-lane structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` validation capture set before the Stage 248 audit pass if the current Stage 246 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 247 Windows Edge harness to capture narrower-width focused `Study` and surrounding reader-led states intentionally before the Stage 248 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` right lane no longer reads like a tall secondary column of prompt, reveal, and support chrome beside Reader.
- Supporting evidence begins sooner without breaking review flow, grading, evidence selection, or Reader handoffs.
- The Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 241 focused `Study` gains, and Stage 245 focused `Graph` gains remain intact.
- The next audit can judge whether any remaining narrower-width focused-work mismatch still materially leads after the bundled focused `Study` correction.
