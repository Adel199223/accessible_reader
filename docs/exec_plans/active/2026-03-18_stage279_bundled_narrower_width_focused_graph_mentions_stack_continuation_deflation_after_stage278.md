# ExecPlan: Stage 279 Bundled Narrower-Width Focused Graph Mentions-Stack Continuation Deflation After Stage 278

## Summary
- Use the March 18, 2026 Stage 278 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Shift the active surface back to focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 277 succeeded overall and the focused `Graph` `Node detail` mentions stack is now the clearest remaining narrow-width blocker again.

## Problem Statement
- Stage 275 materially calmed the focused `Graph` `Node detail` header and leading evidence stack, and Stage 277 resolved the leading answer-shown focused `Study` mismatch without regressing neighboring focused surfaces.
- At `820x980`, the focused `Graph` `Node detail` lane still regains too much weight beside Reader.
- The repeated grounded mention cards, repeated excerpt rhythm, and repeated Reader handoff rows still make the right lane read more like a mini-card column than one quieter support continuation beside live reading.

## Goals
- Make the focused `Graph` `Node detail` mentions stack read like a calmer continuation beside Reader at the narrower breakpoint.
- Bundle the remaining mention-stack reductions into one localized pass instead of reopening single-delta Graph micro-stages.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 275 focused `Graph` support-stack gains, and Stage 277 focused `Study` answer-shown gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the localized mentions-stack continuation still needs a dedicated narrow-only hook
  - keep the Stage 275 and Stage 277 gains stable and localize the bundle to the focused `Graph` `Node detail` mentions stack
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine focused `Graph` narrow-only hooks only if the bundled mentions stack still needs localized selectors
- `frontend/src/index.css`
  - further deflate the focused `Graph` repeated mention-card chrome, excerpt rhythm, and repeated Reader handoff rows at the targeted breakpoint
  - reduce the visual separation between consecutive grounded mentions so the lane reads more like one quieter support flow
  - keep grounded evidence and Reader retarget/open actions obvious while demoting redundant framing that still makes the lane feel louder than Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 279 validation capture set if the current Stage 278 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 279 Windows Edge harness to capture the focused `Graph` mentions stack intentionally before the Stage 280 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Node detail` mentions stack no longer reads louder than the neighboring narrow focused surfaces beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 275 focused `Graph` gains, and Stage 277 focused `Study` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled mentions-stack deflation or whether another surface now becomes the clearer follow-up.
