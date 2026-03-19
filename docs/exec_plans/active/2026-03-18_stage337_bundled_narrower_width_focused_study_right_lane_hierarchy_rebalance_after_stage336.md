# ExecPlan: Stage 337 Bundled Narrower-Width Focused Study Right-Lane Hierarchy Rebalance After Stage 336

## Summary
- Use the March 18, 2026 Stage 336 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch the active surface back to focused `Study` at `820x980`, because Stage 335 succeeded overall and the fresh audit suggests the loudest remaining narrow-width blocker is now the boxed right `Active card` lane beside Reader.
- Keep the next step broad enough to matter: treat prompt, reveal/rating, and supporting-evidence hierarchy as one bundled right-lane rebalance instead of reopening tiny seam edits.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not a micro-adjustment.

## Problem Statement
- Stage 321, Stage 323, and Stage 325 materially calmed focused `Study`, but the current Stage 336 screenshots still show the right lane reading like a separate destination panel beside Reader.
- The pre-answer and answer-shown states both retain a boxed `Active card` shell, with support controls and supporting evidence still feeling more like stacked destinations than one secondary continuation.
- Reader should remain primary at `820x980`, but the focused `Study` right lane still needs a stronger hierarchy reset so it feels like one calmer support flow.
- Because the user explicitly asked for significant, visible progress, Stage 337 should stay bundled and should not collapse into another button-by-button or chip-by-chip pass.

## Goals
- Keep Reader clearly primary while making the focused `Study` right lane calmer and less boxy at `820x980`.
- Rebalance the prompt/reveal/rating seam and supporting-evidence continuation together so the right lane reads like one support flow.
- Improve both pre-answer and answer-shown states in one pass.
- Produce another clearly noticeable visual change, not a hidden micro-adjustment.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, Stage 331 focused `Graph` gains, Stage 333 focused `Graph` gains, and the new Stage 335 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, study generation logic, grading semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove study prompt text, answer reveal, rating actions, supporting evidence, or Reader handoffs from focused `Study`.
- Do not widen this pass into a different surface or breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the right-lane sections need a localized hook for a cleaner bundled selector
  - treat this as one visibly broader right-lane hierarchy pass: avoid splitting prompt/reveal and supporting-evidence pacing into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Study` hooks only if the right-lane hierarchy needs a more explicit narrow-breakpoint selector
- `frontend/src/index.css`
  - flatten the right-lane shell so it feels less like a boxed destination panel
  - tighten and calm the prompt/reveal/rating seam in both pre-answer and answer-shown states
  - make supporting evidence feel like a continuation instead of a separate destination block
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if another localized hierarchy hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the current focused `Study` top captures unless one additional right-lane crop is needed to show the hierarchy reset clearly

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 337/338 Windows Edge harness files
- run the Stage 337 Windows Edge validation harness against the live localhost app before the Stage 338 audit

## Exit Criteria
- At `820x980`, focused `Study` still exposes the current study workflow, but the right lane reads as a calmer support flow beside Reader rather than a boxed destination panel.
- Stage 337 makes another clearly noticeable visual change at a glance.
- Focused `Study` evidence, rating actions, Reader handoffs, and source continuity remain intact.
- The next audit can decide whether focused `Study` still materially leads after the right-lane hierarchy reset or whether another surface becomes the clearer next blocker.
