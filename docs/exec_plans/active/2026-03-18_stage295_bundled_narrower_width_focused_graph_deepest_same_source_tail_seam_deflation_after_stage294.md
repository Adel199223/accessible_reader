# ExecPlan: Stage 295 Bundled Narrower-Width Focused Graph Deepest Same-Source Tail Seam Deflation After Stage 294

## Summary
- Use the March 18, 2026 Stage 294 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 293 succeeded overall and the deepest same-source `Node detail` continuation rows are still the clearest remaining narrow-width blocker.

## Problem Statement
- Stage 293 materially calmed the focused `Graph` trailing same-source confidence/action seam, and the repeated rows no longer split their utility cues across two stacked levels.
- At `820x980`, the focused `Graph` `Node detail` lane still regains too much weight deeper in the same-source tail beneath the leading evidence card beside Reader.
- The deepest same-source continuation rows still accumulate too many tiny utility seams, so the bottom of the `Mentions` stack reads more like a repeated utility tail than one quiet continuation of the leading evidence card.

## Goals
- Make the deepest same-source focused `Graph` continuation rows read like a calmer tail beneath the leading evidence card at the narrower breakpoint.
- Bundle the remaining deepest-tail seam reductions into one localized pass instead of switching surfaces prematurely.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, and Stage 293 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the deepest same-source continuation rows still need a dedicated narrow-only hook
  - keep the Stage 293 focused `Graph` gains and the Stage 291 focused `Study` gains stable while localizing the bundle to the deepest same-source focused `Graph` continuation rows
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine deepest-tail focused `Graph` narrow-only hooks only if the bundled pass still needs localized selectors
- `frontend/src/index.css`
  - further deflate the deepest same-source trailing-row utility seam at the targeted breakpoint
  - reduce the perceived repetition between the smallest repeated confidence/action cues so the bottom of the `Mentions` stack reads more like one quiet continuation
  - keep grounded evidence and Reader retarget/open actions obvious while demoting redundant deepest-tail chrome that still makes the lane feel louder than Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 295 validation capture set if the current Stage 294 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 295 Windows Edge harness to capture the focused `Graph` deepest same-source tail intentionally before the Stage 296 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` deepest same-source tail no longer reads louder than the neighboring narrow focused surfaces beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, and Stage 293 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled deepest-tail seam deflation or whether another surface now becomes the clearer follow-up.
