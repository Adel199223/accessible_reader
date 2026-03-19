# ExecPlan: Stage 291 Bundled Narrower-Width Focused Study Answer-Shown Rating Row And Support Header Compaction After Stage 290

## Summary
- Use the March 18, 2026 Stage 290 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Shift the active surface back to answer-shown focused `Study` in bundled dominant-surface mode at `820x980`, because Stage 289 succeeded overall and the revealed-answer right lane is now the clearest remaining narrow-width blocker again.

## Problem Statement
- Stage 289 materially calmed the focused `Graph` trailing same-source rows, and focused `Graph` no longer reads like the loudest narrow support lane beside Reader.
- At `820x980`, the answer-shown focused `Study` right lane still regains too much weight beside Reader.
- The answer-shown rating row and supporting-evidence header/action seam still accumulate a bit too much destination chrome, so the lane reads more like a stacked destination block than one quieter continuation beneath the revealed answer.

## Goals
- Make the answer-shown focused `Study` rating row and supporting-evidence header read like a calmer continuation beside Reader at the narrower breakpoint.
- Bundle the remaining answer-shown row/header compaction into one localized pass instead of reopening another one-delta Study micro-stage.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, and Stage 289 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, study scheduling or review semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Study` flow, reveal/rating controls, supporting evidence, or Reader handoffs.
- Do not widen this pass into a shell change, a Graph/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the localized answer-shown rating row/support header still needs a dedicated narrow-only hook
  - keep the Stage 287 focused `Study` gains and the new Stage 289 focused `Graph` gains stable while localizing the bundle to the answer-shown focused `Study` right lane
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine answer-shown focused `Study` narrow-only hooks only if the bundled row/header compaction still needs localized selectors
- `frontend/src/index.css`
  - further deflate the answer-shown rating row and supporting-evidence header/action seam at the targeted breakpoint
  - reduce the perceived separation between the rating controls and the supporting-evidence continuation so the lane reads more like one quieter support flow
  - keep grading controls, supporting evidence, and Reader retarget/open actions obvious while demoting redundant framing that still makes the lane feel louder than Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 291 validation capture set if the current Stage 290 focused `Study` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 291 Windows Edge harness to capture the answer-shown focused `Study` rating-row/support-header seam intentionally before the Stage 292 audit

## Exit Criteria
- At the targeted narrower desktop width, the answer-shown focused `Study` rating row and supporting-evidence header no longer read louder than the neighboring narrow focused surfaces beside Reader.
- Focused `Study` reveal/rating controls, supporting evidence, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, and Stage 289 focused `Graph` gains remain intact.
- The next audit can decide whether answer-shown focused `Study` still materially leads after the bundled rating-row/support-header compaction or whether another surface now becomes the clearer follow-up.
