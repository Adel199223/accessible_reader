# ExecPlan: Stage 301 Bundled Narrower-Width Focused Graph Mentions Entry And Leading-Card Seam Deflation After Stage 300

## Summary
- Use the March 18, 2026 Stage 300 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active surface on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 299 succeeded overall but focused `Graph` still remains the clearest narrow-width blocker.

## Problem Statement
- Stage 299 materially calmed the focused `Graph` continuation stack, and the same-source rows now read more like one grouped continuation than the Stage 298 version.
- At `820x980`, focused `Graph` still reads a bit too much like a separate boxed destination beside Reader.
- The `Mentions` entry and first grounded evidence card still create a strong boxed seam before the calmer continuation cluster, so the right `Node detail` lane still competes more than it should beside Reader.

## Goals
- Make the focused `Graph` `Mentions` entry and first grounded evidence card read more like one calmer continuation beneath `Node detail` at the narrower breakpoint.
- Reduce the section-entry seam so the right lane feels more secondary beside Reader without hiding grounded evidence or actions.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, and Stage 299 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, grounded mentions, decision actions, or Reader handoffs.
- Do not widen this pass into a shell change, a Study/Notes change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the `Mentions` entry still needs one localized hook
  - keep the Stage 299 continuation-stack gains and the calmer neighboring focused surfaces stable while localizing the bundle to the `Mentions` header plus leading-card seam inside focused `Graph`
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine a narrow-only focused `Graph` `Mentions` entry hook only if the bundle still needs a selector that distinguishes the leading grounded evidence card from the quieter continuation rows
- `frontend/src/index.css`
  - soften the seam between the `Mentions` entry and the leading grounded evidence card at the targeted breakpoint
  - reduce boxed framing, vertical separation, or repeated entry chrome that still makes the first evidence block read like a destination panel instead of the start of one support flow
  - keep grounded evidence, confidence, and Reader retarget/open actions obvious while demoting the extra entry chrome that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only `Mentions` hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 301 validation capture set if the current Stage 300 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 301 Windows Edge harness to capture the focused `Graph` `Mentions` entry and leading-card seam intentionally before the Stage 302 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Mentions` entry and first grounded evidence card no longer read like a separate boxed destination beside Reader.
- Focused `Graph` grounded evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, and Stage 299 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled `Mentions` entry deflation or whether another surface now becomes the clearer follow-up.
