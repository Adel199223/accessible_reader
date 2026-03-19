# ExecPlan: Stage 289 Bundled Narrower-Width Focused Graph Trailing Same-Source Row Density Deflation After Stage 288

## Summary
- Use the March 18, 2026 Stage 288 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Shift the active surface back to focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 287 succeeded overall and the trailing same-source mention stack is now the clearest remaining narrow-width blocker again.

## Problem Statement
- Stage 287 materially calmed the answer-shown focused `Study` rating/support seam, and answer-shown focused `Study` no longer reads like the loudest narrow support lane beside Reader.
- At `820x980`, the focused `Graph` `Node detail` lane still regains too much weight beneath the leading evidence card beside Reader.
- The repeated same-source trailing mention rows still accumulate too much stack height and excerpt repetition, so the right lane reads more like a dense evidence ledger than one quieter continuation beneath the leading mention card.

## Goals
- Make the trailing same-source focused `Graph` mention rows read like a calmer continuation beneath the leading evidence card at the narrower breakpoint.
- Bundle the remaining repeated-row density reductions into one localized pass instead of reopening another one-delta Graph micro-stage.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, and Stage 287 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the same-source trailing rows still need a dedicated narrow-only hook
  - keep the Stage 285 focused `Graph` gains and the new Stage 287 focused `Study` gains stable while localizing the bundle to the trailing same-source focused `Graph` mention rows
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine focused `Graph` same-source trailing-row narrow-only hooks only if the bundled density pass still needs localized selectors
- `frontend/src/index.css`
  - further deflate the focused `Graph` same-source trailing-row stack density at the targeted breakpoint
  - reduce the perceived repetition between the same-source label, excerpt, and utility seam so the lane reads more like one quieter support flow
  - keep grounded evidence and Reader retarget/open actions obvious while demoting redundant repeated-row chrome that still makes the lane feel louder than Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 289 validation capture set if the current Stage 288 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 289 Windows Edge harness to capture the focused `Graph` trailing same-source stack intentionally before the Stage 290 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` trailing same-source mention rows no longer read louder than the neighboring narrow focused surfaces beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, and Stage 287 focused `Study` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled same-source row-density deflation or whether another surface now becomes the clearer follow-up.
