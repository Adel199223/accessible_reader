# ExecPlan: Stage 321 Bundled Narrower-Width Focused Study Right-Lane Prompt/Support Shell Deflation After Stage 320

## Summary
- Use the March 18, 2026 Stage 320 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Move the active surface to focused `Study` in bundled dominant-surface mode at `820x980`, because Stage 319 succeeded overall and focused `Study` now remains the clearest narrow-width blocker.

## Problem Statement
- Stage 319 materially calmed focused `Graph` and removed it as the lead narrow mismatch.
- At `820x980`, focused `Study` now reads slightly too much like a support lane competing with Reader.
- The right `Active card` prompt/support shell still reads too much like a second destination panel beside Reader in both pre-answer and answer-shown states.

## Goals
- Make the focused `Study` right lane read more like one quiet support continuation beside Reader instead of a second destination panel at the narrower breakpoint.
- Demote the prompt/support shell framing without hiding study actions, evidence, or Reader handoffs.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, and Stage 319 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, study generation or grading semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove focused `Study` review actions, evidence, or Reader handoffs.
- Do not widen this pass into a shell change, a Graph/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundle still needs one localized hook around the right focused `Study` prompt/support shell
  - keep the Stage 319 focused `Graph` gains and the calmer neighboring focused surfaces stable while localizing the bundle to the right-lane shell that still competes with Reader inside focused `Study`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Study` hook only if the bundle still needs a selector that distinguishes the remaining prompt/support shell from the rest of the lane
- `frontend/src/index.css`
  - demote the remaining focused `Study` right-lane prompt/support shell at the targeted breakpoint
  - reduce the destination-panel feel so the lane reads more like one quiet support continuation beside Reader
  - keep study actions, evidence, and Reader handoffs obvious while demoting the shell framing that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 321 validation capture set if the current Stage 320 focused `Study` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 321 Windows Edge harness to capture the focused `Study` right lane intentionally before the Stage 322 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` right `Active card` prompt/support shell no longer reads like a second destination panel beside Reader.
- Focused `Study` review actions, evidence, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, and Stage 319 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Study` still materially leads after the bundled shell deflation or whether another surface now becomes the clearer follow-up.
