# ExecPlan: Stage 305 Bundled Narrower-Width Focused Graph Same-Source Continuation Tail Deflation After Stage 304

## Summary
- Use the March 18, 2026 Stage 304 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 303 succeeded overall but focused `Graph` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 303 materially calmed the focused `Graph` leading grounded evidence card and softened the immediate same-source bridge beneath it.
- At `820x980`, focused `Graph` still reads slightly too much like a compact support ledger beside Reader.
- The same-source continuation tail beneath the softened leading bridge still keeps too much repeated confidence/action rhythm and row segmentation, so the right `Node detail` lane still competes more than it should beside Reader.

## Goals
- Make the focused `Graph` same-source continuation tail beneath the leading bridge read more like one calmer continuation beneath `Mentions` at the narrower breakpoint.
- Reduce repeated utility seams and mini-row rhythm so the right lane feels more secondary beside Reader without hiding grounded evidence, confidence, or Reader actions.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, and Stage 303 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundle still needs one localized hook around the same-source continuation tail beneath the leading bridge
  - keep the Stage 303 leading-card gains and the calmer neighboring focused surfaces stable while localizing the bundle to the continuation rows inside focused `Graph`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Graph` hook only if the bundle still needs a selector that distinguishes the same-source continuation tail below the softened leading bridge from the calmer higher-level seam above it
- `frontend/src/index.css`
  - soften the repeated confidence/action seam inside the same-source continuation tail at the targeted breakpoint
  - reduce mini-row rhythm, action-pill repetition, or repeated border seams that still make the continuation tail read like a utility ledger instead of a support flow
  - keep grounded evidence, confidence, and Reader retarget/open actions obvious while demoting the repeated utility chrome that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 305 validation capture set if the current Stage 304 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 305 Windows Edge harness to capture the focused `Graph` same-source continuation tail intentionally before the Stage 306 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` same-source continuation tail no longer reads like a compact mini-ledger beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, and Stage 303 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled same-source-tail deflation or whether another surface now becomes the clearer follow-up.
