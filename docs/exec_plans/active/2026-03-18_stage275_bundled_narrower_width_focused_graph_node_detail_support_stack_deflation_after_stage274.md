# ExecPlan: Stage 275 Bundled Narrower-Width Focused Graph Node Detail Support-Stack Deflation After Stage 274

## Summary
- Use the March 18, 2026 Stage 274 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Shift the active surface back to focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 273 succeeded overall and the focused `Graph` `Node detail` support stack is now the clearest remaining narrow-width blocker.

## Problem Statement
- Stage 267 materially calmed the focused `Graph` right lane, and Stage 273 resolved the leading answer-shown focused `Study` mismatch without regressing neighboring focused surfaces.
- At `820x980`, the focused `Graph` `Node detail` lane still regains too much weight beside Reader.
- The header action treatment, the first grounded mention card, and the stacked Reader handoff controls still make the right lane read louder than the neighboring narrow focused surfaces even though the broader `Node detail` lane is calmer than before.

## Goals
- Make the focused `Graph` `Node detail` lane read like a calmer support continuation beside Reader at the narrower breakpoint.
- Bundle the remaining `Node detail` support-stack reductions into one localized pass instead of reopening single-delta Graph micro-stages.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 267 focused `Graph` bundled lane gains, and Stage 273 focused `Study` bundled answer-shown gains.

## Non-Goals
- Do not change backend APIs, graph extraction, confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Graph` flow, evidence grounding, decision actions, or Reader handoffs.
- Do not widen this pass into a graph browse-mode rewrite, a shell change, or a different surface.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the localized focused `Graph` support stack still needs a dedicated narrow-only hook
  - keep the Stage 267 gains stable and localize the bundle to the focused `Graph` `Node detail` support stack
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine focused `Graph` narrow-only hooks only if the bundled support-stack continuation still needs localized selectors
- `frontend/src/index.css`
  - further deflate the focused `Graph` header action seam, first mention-card chrome, and stacked Reader handoff controls at the targeted breakpoint
  - reduce the visual separation between the selected-node glance and the first grounded evidence so the lane reads more like one quieter support flow
  - keep confirm/reject and Reader retarget/open actions obvious while demoting redundant framing that still makes the lane feel louder than Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 275 validation capture set if the current Stage 274 focused `Graph` capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 275 Windows Edge harness to capture the focused `Graph` `Node detail` stack intentionally before the Stage 276 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` `Node detail` lane no longer reads louder than the neighboring narrow focused surfaces beside Reader.
- Focused `Graph` evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 267 focused `Graph` gains, and Stage 273 focused `Study` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled support-stack deflation or whether another surface now becomes the clearer follow-up.
