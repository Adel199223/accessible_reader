# ExecPlan: Stage 299 Bundled Narrower-Width Focused Graph Node Detail Continuation-Stack Fusion After Stage 298

## Summary
- Use the March 18, 2026 Stage 298 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 297 succeeded overall but focused `Graph` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 297 materially calmed the deepest same-source focused `Graph` tail, and the lowest continuation rows no longer read like a stacked mini-ladder.
- At `820x980`, focused `Graph` still reads a bit too much like a separate boxed destination beside Reader.
- The right `Node detail` lane still segments the leading grounded evidence card from the same-source continuation cluster, so the `Mentions` stack still feels like stacked destinations instead of one calmer support flow.

## Goals
- Make the focused `Graph` `Node detail` continuation stack read more like one continuous support flow beneath `Mentions` at the narrower breakpoint.
- Reduce the perceived segmentation between the leading grounded evidence card and the same-source continuation cluster so the right lane feels more secondary beside Reader.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, and Stage 297 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the `Mentions` continuation stack still needs one more localized grouping hook
  - keep the Stage 297 deepest-tail rhythm gains and the calmer neighboring focused surfaces stable while localizing the bundle to the segmented `Node detail` continuation stack inside focused `Graph`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Graph` continuation hook only if the bundle still needs a selector that distinguishes the leading evidence card plus same-source continuation cluster from the rest of the lane
- `frontend/src/index.css`
  - fuse the leading grounded evidence card and the same-source continuation cluster into a calmer continuation stack at the targeted breakpoint
  - reduce boxed seams, subsection weight, or repeated stack framing that still makes the right lane feel more like a separate destination than a secondary support pane
  - keep grounded evidence, confidence, and Reader retarget/open actions obvious while demoting the extra continuation chrome that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only continuation hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 299 validation capture set if the current Stage 298 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 299 Windows Edge harness to capture the focused `Graph` `Node detail` continuation stack intentionally before the Stage 300 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Node detail` continuation stack no longer reads like stacked boxed destinations beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, and Stage 297 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled continuation-stack fusion or whether another surface now becomes the clearer follow-up.
