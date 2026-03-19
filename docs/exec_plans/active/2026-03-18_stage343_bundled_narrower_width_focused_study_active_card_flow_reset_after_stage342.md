# ExecPlan: Stage 343 Bundled Narrower-Width Focused Study Active-Card Flow Reset After Stage 342

## Summary
- Use the March 18, 2026 Stage 342 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Move the active bundled dominant-surface pass back to focused `Study` at `820x980`, because Stage 341 succeeded overall and materially calmed the focused `Graph` lower rail while the neighboring focused `Study` captures remained stable and still feel more boxed beside Reader.
- Keep the next step broad enough to matter: reset the focused `Study` right lane as one calmer active-card flow instead of reopening tiny prompt, reveal, or support-seam tweaks.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not a micro-adjustment.

## Problem Statement
- Stage 337 materially improved focused `Study`, and later focused-Study passes reduced individual seams.
- The fresh Stage 342 capture set suggests the remaining narrow-width mismatch is now concentrated in focused `Study`: the right lane still reads as a boxed destination panel beside Reader, especially once the prompt, reveal, answer-shown controls, and supporting evidence stack accumulate.
- Reader should remain primary at `820x980`, but focused `Study` still needs a broader active-card flow reset so the whole right lane reads like one guided continuation rather than a stacked side panel.
- Because the user explicitly asked for significant, visible progress, Stage 343 should remain bundled. If the focused `Study` lane does not look meaningfully different at a glance, it is the wrong slice.

## Goals
- Keep focused `Study` subordinate to Reader while making the full right-lane active-card flow calmer and less boxed at `820x980`.
- Treat prompt, reveal/answer state, rating row, supporting evidence, and grounding continuation as one bundled readability/hierarchy reset.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, Stage 331 focused `Graph` gains, Stage 333 focused `Graph` gains, Stage 335 focused `Graph` gains, Stage 337 focused `Study` gains, Stage 339 focused `Graph` gains, and the new Stage 341 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, study generation or grading semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove study evidence, answer reveal, rating actions, or Reader handoffs from focused `Study`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the right lane needs a cleaner localized hook for a true flow reset
  - treat this as one visibly broader focused-Study bundle: avoid splitting prompt shell, answer-shown flow, and support continuation into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Study` hooks only if the right-lane active-card flow or answer-shown state needs cleaner targeted selectors
- `frontend/src/index.css`
  - preserve the calmer focused `Study` hierarchy gains from Stage 337
  - reduce the boxed-destination feel of the active-card lane in both pre-answer and answer-shown states
  - make the full right lane read more like one guided continuation beside Reader instead of stacked destination panels
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Study` structural expectations aligned if another localized hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Study Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 337/338 focused-Study top crops unless the bundled right-lane reset needs one adjusted crop that better captures the whole active-card flow

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 343/344 Windows Edge harness files
- run the Stage 343 Windows Edge validation harness against the live localhost app before the Stage 344 audit

## Exit Criteria
- At `820x980`, the focused `Study` right lane still reads as support beside Reader, and the full active-card flow no longer feels like a boxed destination panel.
- Stage 343 makes another clearly noticeable focused `Study` change at a glance, not just a hard-to-spot seam reduction.
- Focused `Study` evidence, answer reveal, rating actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Study` now materially leads or whether another surface becomes the clearer next blocker.
