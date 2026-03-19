# ExecPlan: Stage 273 Bundled Narrower-Width Focused Study Answer-Shown Right-Lane Deflation After Stage 272

## Summary
- Use the March 18, 2026 Stage 272 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Study` in bundled dominant-surface mode at `820x980`, because Stage 271 succeeded overall but the answer-shown right lane still remains the leading narrow-width blocker.

## Problem Statement
- Stage 269 calmed the default focused `Study` right lane, and Stage 271 reduced the answer-shown stack height without destabilizing neighboring focused surfaces.
- At `820x980`, the answer-shown focused `Study` lane still regains too much weight beside Reader.
- The revealed answer, rating controls, and supporting evidence still read like separate stacked destinations, so the right lane continues to compete with live reading after the answer is shown.

## Goals
- Make the answer-shown focused `Study` lane read like one calmer continuation beside Reader.
- Bundle the remaining answer-shown reductions into one localized pass instead of another single-delta micro-stage.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 267 focused `Graph` bundled lane gains, and Stage 269 focused `Study` panel-fusion gains.

## Non-Goals
- Do not change backend APIs, study-card generation, reveal/rating semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Study` flow, answer reveal controls, rating actions, source evidence, grounding, or Reader handoffs.
- Do not widen this pass into a Study browse-mode rewrite, a shared shell change, or a different surface.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the bundled answer-shown state still needs a dedicated narrow-only hook
  - keep the Stage 269 fusion gains stable and localize the bundle to the answer-shown right lane
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine focused `Study` answer-shown hooks only if the bundled right-lane continuation still needs a narrower-only modifier
- `frontend/src/index.css`
  - further deflate the answer-shown review shell, the rating seam, and the supporting-evidence continuation at the targeted breakpoint
  - reduce the visual separation between revealed answer, rating controls, and supporting evidence so they read as one quieter support flow
  - keep actions obvious while demoting redundant metadata or framing that still makes the lane feel like a second destination
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if the bundled answer-shown hooks change
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study handoff expectations aligned if the answer-shown structure changes
- repo-owned Edge harness
  - add a Stage 273 validation capture set if the current Stage 271 answer-shown capture set is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 273 Windows Edge harness to capture the answer-shown focused `Study` lane intentionally before the Stage 274 audit

## Exit Criteria
- At the targeted narrower desktop width, the answer-shown focused `Study` right lane no longer reads like separate stacked destinations beside Reader.
- Focused `Study` reveal, rating, supporting evidence, grounding, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 267 focused `Graph` gains, and Stage 269 focused `Study` gains remain intact.
- The next audit can decide whether focused `Study` still materially leads after the bundled answer-shown deflation or whether another surface now becomes the clearer follow-up.
