# ExecPlan: Stage 269 Bundled Narrower-Width Focused Study Right-Lane Panel Fusion After Stage 268

## Summary
- Use the March 17, 2026 Stage 268 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch the active surface back to focused `Study` at `820x980`, and stay in bundled dominant-surface mode because Stage 267 succeeded overall and the remaining mismatch is now localized in the right lane.

## Problem Statement
- Stage 267 successfully calmed focused `Graph` without destabilizing neighboring focused surfaces.
- At `820x980`, focused `Study` now stands out more clearly as the remaining narrow mismatch.
- The right lane still reads like two stacked destination panels, `Active card` and `Supporting evidence`, with separate headings, borders, and action groupings, so it still competes with Reader instead of behaving like one calmer support flow.

## Goals
- Batch 2-3 tightly related narrow-only focused `Study` right-lane reductions in one pass instead of returning to single-delta micro-corrections.
- Make `Active card` and `Supporting evidence` feel like one calmer support sequence beside Reader.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, Stage 261 focused `Notes` drawer-open browse-empty gains, Stage 263 focused `Notes` drawer-open empty-detail gains, and Stage 267 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, study-card generation, reveal/rating semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the focused `Study` flow, Reader handoffs, answer reveal controls, review actions, or source evidence.
- Do not widen this pass into another full focused split rebalance, a broader Study browse-mode rewrite, or a shell redesign.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the right lane needs a bundled narrow-only hook
  - treat the remaining mismatch as one right-lane problem, not as isolated prompt/evidence micro-issues
  - keep the Stage 247 and Stage 257 focused `Study` gains stable while making the right lane feel more like one support column
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine narrow-only hooks around the focused `Study` right-lane panels only if needed to support a fused calmer treatment
- `frontend/src/index.css`
  - reduce the separation between the focused `Study` `Active card` and `Supporting evidence` panels at the targeted breakpoint
  - flatten repeated panel chrome and action clustering so the right lane reads more continuously
  - tighten the handoff from prompt/reveal to supporting evidence without changing study behavior
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if bundled right-lane hooks change
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study handoff expectations aligned if the right-lane structure changes
- repo-owned Edge harness
  - add a bundled narrower-width focused `Study` validation capture set before the Stage 270 audit pass if the current Stage 268 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 269 Windows Edge harness to capture the bundled focused `Study` right-lane treatment intentionally before the Stage 270 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Study` right lane no longer reads like two stacked destination cards beside Reader.
- Focused `Study` reveal, rating, supporting evidence, grounding, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, Stage 261 drawer-open browse-empty gains, Stage 263 drawer-open empty-detail gains, and Stage 267 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Study` still materially leads after the bundled right-lane pass or whether another surface now becomes the clearer follow-up.
