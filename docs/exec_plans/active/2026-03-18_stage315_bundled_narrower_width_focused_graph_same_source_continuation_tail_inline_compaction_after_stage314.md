# ExecPlan: Stage 315 Bundled Narrower-Width Focused Graph Same-Source Continuation Tail Inline Compaction After Stage 314

## Summary
- Use the March 18, 2026 Stage 314 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 313 succeeded overall but focused `Graph` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 313 materially softened the same-source continuation ladder and made the repeated preview/action rows feel less segmented than the Stage 312 version.
- At `820x980`, focused `Graph` still reads slightly too much like a support lane competing with Reader.
- The remaining deepest same-source continuation tail still accumulates as a tiny repeated one-line list beneath the calmer ladder, so the `Node detail` lane still feels a bit too tall and segmented beside Reader.

## Goals
- Make the focused `Graph` deepest same-source continuation tail read more like one compact inline continuation beneath the calmer ladder at the narrower breakpoint.
- Reduce the repeated one-line tail rhythm without hiding grounded evidence or Reader handoffs.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, and Stage 313 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove focused `Graph` grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundle still needs one localized hook around the deepest same-source continuation tail beneath the calmer ladder
  - keep the Stage 313 ladder gains and the calmer neighboring focused surfaces stable while localizing the bundle to the deepest one-line tail rhythm that still competes with Reader inside focused `Graph`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Graph` hook only if the bundle still needs a selector that distinguishes the remaining deepest same-source tail from the rest of the continuation flow
- `frontend/src/index.css`
  - soften the remaining deepest same-source continuation tail beneath the calmer ladder at the targeted breakpoint
  - reduce the repeated one-line tail rhythm so the continuation reads more like one compact inline flow beneath the leading grounded evidence card
  - keep grounded evidence, retarget/open actions, and current focused-source continuity obvious while demoting the deepest tail rhythm that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 315 validation capture set if the current Stage 314 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 315 Windows Edge harness to capture the focused `Graph` deepest same-source continuation tail intentionally before the Stage 316 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` deepest same-source continuation rows no longer read like a tiny repeated one-line tail beneath the calmer ladder beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, and Stage 313 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled continuation-tail compaction or whether another surface now becomes the clearer follow-up.
