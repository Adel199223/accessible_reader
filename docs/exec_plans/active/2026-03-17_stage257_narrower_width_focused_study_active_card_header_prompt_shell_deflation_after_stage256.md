# ExecPlan: Stage 257 Narrower-Width Focused Study Active Card Header Prompt Shell Deflation After Stage 256

## Summary
- Use the March 17, 2026 Stage 256 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch surfaces again because the fresh audit says the focused `Graph` decision-row correction succeeded overall and the next remaining narrower-width mismatch is now the focused `Study` `Active card` header and prompt shell.

## Problem Statement
- Stage 255 and Stage 256 reduced the focused `Graph` `Node detail` decision row without destabilizing the neighboring focused surfaces.
- At `820x980`, focused `Study` now stands out again beside Reader.
- The main offender is localized: the `Active card` heading, meta line, and prompt shell still read a little too tall and segmented before supporting evidence settles into the calmer lower lane.

## Goals
- Reduce the visual and structural weight of the focused `Study` `Active card` header and prompt shell at the narrower breakpoint.
- Keep `Show answer`, review flow, source evidence, and Reader handoffs intact while letting Reader stay clearly primary.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 247 focused `Study` right-lane bundle gains, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, and Stage 255 focused `Graph` decision-row gains.

## Non-Goals
- Do not change backend APIs, study generation, review/grading semantics, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into another broad focused split rewrite or cross-surface redesign.
- Do not remove the ability to reveal answers, review cards, inspect supporting evidence, or reopen source context from focused `Study`.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the focused `Study` header or prompt shell needs a calmer narrow-only grouping hook
  - flatten the top `Active card` stack before shrinking any real answer/review affordance
  - keep the Reader column width and calmer `Study queue` rail stable while reducing the right lane's perceived prominence
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Study` right-lane grouping only if a small wrapper or class hook is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Study` header/meta spacing and prompt-shell contrast at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structure expectations aligned if the active-card header/prompt shell wrapper changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Study` handoffs aligned if the active-card header/prompt shell structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Study` validation capture set before the Stage 258 audit pass if the current Stage 256 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 257 Windows Edge harness to capture narrower-width focused `Study` and surrounding reader-led states intentionally before the Stage 258 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` `Active card` header and prompt shell no longer read louder than the neighboring focused rails and panels beside Reader.
- Reader stays clearly primary while answer/review flow, source evidence, and continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, and Stage 255 focused `Graph` gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Study` follow-up.
