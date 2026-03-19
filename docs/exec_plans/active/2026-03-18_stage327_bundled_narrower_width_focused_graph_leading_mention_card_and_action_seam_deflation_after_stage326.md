# ExecPlan: Stage 327 Bundled Narrower-Width Focused Graph Leading Mention Card And Action Seam Deflation After Stage 326

## Summary
- Use the March 18, 2026 Stage 326 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch the active surface back to focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 325 succeeded overall and the lead narrow-width blocker now sits in focused `Graph`.

## Problem Statement
- Stage 325 materially calmed focused `Study` and kept focused overview, focused `Notes`, and Reader stable.
- At `820x980`, focused `Graph` still reads slightly too much like a support lane competing with Reader.
- The `Node detail` `Mentions` entry, leading grounded evidence card, and attached action seam still carry too much destination-panel weight beside Reader.

## Goals
- Make the focused `Graph` right lane read more like one quiet support continuation beside Reader instead of a destination block at the narrower breakpoint.
- Soften the `Mentions` entry, leading grounded evidence card, and attached action seam without hiding graph evidence, confidence, or Reader handoffs.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, and Stage 325 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove focused `Graph` evidence, confidence cues, validation actions, or Reader handoffs.
- Do not widen this pass into a shell change, a focused `Study` change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundle still needs one localized hook around the leading grounded evidence card and its action seam
  - keep the Stage 325 focused `Study` gains intact while localizing the bundle to the focused `Graph` `Node detail` area that still competes with Reader
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Graph` hook only if the bundle still needs a selector that distinguishes the remaining leading mention-card/action seam from the rest of the lane
- `frontend/src/index.css`
  - soften the remaining focused `Graph` `Mentions` entry, leading grounded evidence card, and attached action seam at the targeted breakpoint
  - reduce the destination-panel feel so the lane reads more like one quiet support continuation beside Reader
  - keep graph evidence, confidence, validation actions, and Reader handoffs obvious while demoting the leading evidence block that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 327 validation capture set if the current Stage 326 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 327 Windows Edge harness to capture the focused `Graph` leading mention-card and action seam intentionally before the Stage 328 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Mentions` entry and leading grounded evidence card/action seam no longer read like a destination block beside Reader.
- Focused `Graph` evidence, validation actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, and Stage 325 focused `Study` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled leading-card pass or whether another surface now becomes the clearer follow-up.
