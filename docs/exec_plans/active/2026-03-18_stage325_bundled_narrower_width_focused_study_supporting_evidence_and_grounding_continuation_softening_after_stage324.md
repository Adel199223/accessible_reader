# ExecPlan: Stage 325 Bundled Narrower-Width Focused Study Supporting-Evidence And Grounding Continuation Softening After Stage 324

## Summary
- Use the March 18, 2026 Stage 324 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Study` in bundled dominant-surface mode at `820x980`, because Stage 323 succeeded overall but focused `Study` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 323 materially calmed focused `Study` and kept focused `Graph` from retaking the lead blocker position.
- At `820x980`, focused `Study` still reads slightly too much like a support lane competing with Reader.
- The supporting-evidence excerpt and grounding continuation still read a bit too much like a second destination block beside Reader, especially in the answer-shown state.

## Goals
- Make the focused `Study` right lane read more like one quiet support continuation beside Reader instead of a second destination block at the narrower breakpoint.
- Soften the supporting-evidence excerpt card and grounding continuation without hiding study actions, evidence, or Reader handoffs.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, and Stage 323 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, study generation or grading semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove focused `Study` review actions, evidence, grounding context, or Reader handoffs.
- Do not widen this pass into a shell change, a Graph/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundle still needs one localized hook around the evidence excerpt and grounding continuation
  - keep the Stage 323 gains intact while localizing the bundle to the evidence/grounding block that still competes with Reader inside focused `Study`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Study` hook only if the bundle still needs a selector that distinguishes the remaining supporting-evidence continuation from the rest of the lane
- `frontend/src/index.css`
  - soften the remaining focused `Study` supporting-evidence excerpt and grounding continuation at the targeted breakpoint
  - reduce the second-destination feel so the lane reads more like one quiet support continuation beside Reader
  - keep study actions, evidence, grounding, and Reader handoffs obvious while demoting the excerpt/grounding block that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 325 validation capture set if the current Stage 324 focused `Study` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 325 Windows Edge harness to capture the focused `Study` supporting-evidence and grounding continuation intentionally before the Stage 326 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` supporting-evidence excerpt and grounding continuation no longer read like a second destination block beside Reader.
- Focused `Study` review actions, evidence, grounding, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, and Stage 323 focused `Study` gains remain intact.
- The next audit can decide whether focused `Study` still materially leads after the bundled supporting-evidence pass or whether another surface now becomes the clearer follow-up.
