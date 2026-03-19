# ExecPlan: Stage 297 Bundled Narrower-Width Focused Graph Deepest Same-Source Tail Row-Rhythm Deflation After Stage 296

## Summary
- Use the March 18, 2026 Stage 296 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 295 succeeded overall but focused `Graph` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 295 materially calmed the focused `Graph` deepest same-source tail seam, and the lowest continuation rows no longer split their utility cues as sharply as the Stage 294 version.
- At `820x980`, focused `Graph` still reads too much like a three-part composition: the right `Node detail` lane still pulls the eye harder than the center Reader pane.
- The deepest same-source continuation rows still stack into a busy mini-row rhythm beneath the leading evidence card, so the bottom of the `Mentions` stack still feels like a repeated utility tail instead of one quiet continuation.

## Goals
- Make the deepest same-source focused `Graph` continuation tail read like one calmer continuation beneath the leading evidence card at the narrower breakpoint.
- Reduce the stacked mini-row rhythm in the deepest tail so the right `Node detail` lane feels more secondary beside Reader.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, and Stage 295 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the deeper tail still needs one more localized hook
  - keep the Stage 295 deepest-tail seam gains and the calmer neighboring focused surfaces stable while localizing the bundle to the deepest same-source continuation rhythm inside focused `Graph`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a deepest-tail focused `Graph` hook only if the bundled pass still needs a selector that distinguishes the deepest repeated rows from the first continuation row
- `frontend/src/index.css`
  - further flatten the deepest same-source trailing-row rhythm at the targeted breakpoint
  - reduce the perceived repetition between the smallest deepest-tail rows so the bottom of the `Mentions` stack feels less like a tiny stacked utility ladder
  - keep grounded evidence and Reader retarget/open actions obvious while demoting redundant deepest-tail chrome that still makes the right lane feel louder than Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 297 validation capture set if the current Stage 296 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 297 Windows Edge harness to capture the focused `Graph` deepest same-source tail intentionally before the Stage 298 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` deepest same-source tail no longer reads like a stacked third utility panel beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, and Stage 295 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled deepest-tail rhythm deflation or whether another surface now becomes the clearer follow-up.
