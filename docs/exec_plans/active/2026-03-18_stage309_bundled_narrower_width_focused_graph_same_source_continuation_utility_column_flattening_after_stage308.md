# ExecPlan: Stage 309 Bundled Narrower-Width Focused Graph Same-Source Continuation Utility-Column Flattening After Stage 308

## Summary
- Use the March 18, 2026 Stage 308 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 307 succeeded overall but focused `Graph` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 307 materially calmed the repeated same-source continuation utility seam and made the tiny confidence plus `Show` / `Open` cues feel less ledger-like.
- At `820x980`, focused `Graph` still reads slightly too much like a support column competing with Reader.
- The same-source continuation rows still present a tiny right-edge utility column beneath the softened leading bridge, so the `Node detail` lane still feels a little too segmented beside Reader.

## Goals
- Make the focused `Graph` same-source continuation rows read more like one quieter continuation beneath the leading grounded evidence card at the narrower breakpoint.
- Flatten the remaining right-edge utility-column feel without hiding grounded evidence or Reader handoffs.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, and Stage 307 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove focused `Graph` grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundle still needs one localized hook around the lingering right-edge utility column inside same-source continuation rows
  - keep the Stage 307 utility-seam gains and the calmer neighboring focused surfaces stable while localizing the bundle to the tiny continuation utility column inside focused `Graph`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Graph` hook only if the bundle still needs a selector that distinguishes the lingering right-edge continuation utility column from the broader same-source continuation flow
- `frontend/src/index.css`
  - flatten the remaining right-edge utility-column feel inside the same-source continuation rows at the targeted breakpoint
  - reduce the sense that repeated inline confidence plus Reader handoff cues form a separate micro-column beneath the leading grounded evidence card
  - keep grounded evidence, retarget/open actions, and current focused-source continuity obvious while demoting the continuation utility chrome that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 309 validation capture set if the current Stage 308 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 309 Windows Edge harness to capture the focused `Graph` same-source continuation utility-column seam intentionally before the Stage 310 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` same-source continuation rows no longer read like a tiny right-edge utility column beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, and Stage 307 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled utility-column flattening or whether another surface now becomes the clearer follow-up.
