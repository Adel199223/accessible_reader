# ExecPlan: Stage 349 Bundled Narrower-Width Focused Study Body-Flow Fusion After Stage 348

## Summary
- Use the March 18, 2026 Stage 348 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Move the active bundled dominant-surface pass back to focused `Study` at `820x980`, because Stage 347 succeeded overall and materially calmed the focused `Graph` evidence flow while the neighboring focused `Study` right lane still reads more boxed and destination-like beside Reader.
- Keep the next step broad enough to matter: fuse the focused `Study` right-lane body flow in both pre-answer and answer-shown states instead of reopening tiny prompt, rating-row, or support-seam tweaks.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not a hidden density-only adjustment.

## Problem Statement
- Stage 337 and Stage 343 materially improved focused `Study`, and Stage 347 materially improved focused `Graph`.
- The fresh Stage 348 capture set suggests the remaining narrow-width mismatch is now concentrated in focused `Study`: the right `Active card` lane still reads like a standing destination panel beside Reader, especially once the prompt, reveal/answer state, rating row, and supporting-evidence shell accumulate.
- Reader should remain primary at `820x980`, but focused `Study` still needs a broader body-flow fusion so the whole right lane reads like one guided continuation rather than a boxed side panel.
- Because the user explicitly asked for significant, visible progress, Stage 349 should remain bundled. If the focused `Study` lane does not look meaningfully different at a glance, it is the wrong slice.

## Goals
- Keep focused `Study` subordinate to Reader while making the full right-lane active-card flow calmer and less boxed at `820x980`.
- Treat prompt, reveal/answer state, rating row, supporting evidence, and grounding continuation as one bundled body-flow reset.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the calmer shell, the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 focused split balance, focused overview gains through Stage 251, focused `Notes` gains through Stage 263, focused `Graph` gains through Stage 347, focused `Study` gains through Stage 343, and current product-behavior constraints.

## Non-Goals
- Do not change backend APIs, study generation or grading semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove study evidence, answer reveal, rating actions, or Reader handoffs from focused `Study`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the right lane needs a cleaner localized wrapper for a true body-flow fusion
  - treat this as one visibly broader focused-Study bundle: avoid splitting prompt shell, answer-shown flow, and support continuation into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Study` hooks only if the right-lane body flow or answer-shown state needs cleaner targeted selectors
- `frontend/src/index.css`
  - preserve the calmer focused `Study` hierarchy gains from Stage 337 and Stage 343
  - reduce the standing-panel feel of the active-card lane in both pre-answer and answer-shown states
  - make the full right lane read more like one guided continuation beside Reader instead of stacked destination cards
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if another localized hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 347/348 focused-Study top crops unless the bundled body-flow fusion needs one adjusted crop that better captures the whole right lane

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 349/350 Windows Edge harness files
- run the Stage 349 Windows Edge validation harness against the live localhost app before the Stage 350 audit

## Exit Criteria
- At `820x980`, the focused `Study` right lane reads as one calmer active-card continuation beside Reader instead of a boxed destination panel.
- Stage 349 makes another clearly noticeable focused `Study` change at a glance, not just a hard-to-spot seam reduction.
- Focused `Study` evidence, answer reveal, rating actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Study` still materially leads or whether another surface becomes the clearer next blocker.
