# ExecPlan: Stage 347 Bundled Narrower-Width Focused Graph Evidence-Flow Fusion After Stage 346

## Summary
- Use the March 18, 2026 Stage 346 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the active bundled dominant-surface pass on focused `Graph` at `820x980`, because Stage 345 succeeded overall and materially calmed the lower follow-on bundle, but the `Node detail` lane still reads like two stacked destinations: one leading grounded-evidence card above a separate calmer bundle.
- Keep the next step broad enough to matter: fuse the leading grounded-evidence preview and the lower follow-on bundle into one calmer evidence flow instead of reopening tiny card-density or action-seam tweaks.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not another hidden typography-only adjustment.

## Problem Statement
- Stage 339, Stage 341, and Stage 345 already improved the focused `Graph` rail: the top hierarchy is calmer, the lower continuation is more readable, and the old tiny ledger-like tail is no longer the main issue.
- The fresh Stage 346 captures show a narrower remaining mismatch: the leading grounded-evidence card still reads like a boxed destination above a separate `More evidence` block, so the full `Node detail` lane does not yet feel like one continuous support flow beside Reader.
- Reader should remain primary at `820x980`, but focused `Graph` still needs a broader evidence-flow fusion so the right lane feels cohesive, readable, and secondary instead of stacked.
- Because the user explicitly asked for significant, visible progress, Stage 347 should stay bundled. If the leading evidence and lower bundle still look like separate destinations, it is the wrong slice.

## Goals
- Keep focused `Graph` subordinate to Reader while making the full `Node detail` evidence flow calmer and more cohesive at `820x980`.
- Treat the leading grounded-evidence preview, the `More evidence` bundle, and any retained lower continuation/footer treatment as one bundled readability/hierarchy reset.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, Stage 331 focused `Graph` gains, Stage 333 focused `Graph` gains, Stage 335 focused `Graph` gains, Stage 337 focused `Study` gains, Stage 339 focused `Graph` gains, Stage 341 focused `Graph` gains, Stage 343 focused `Study` gains, and the new Stage 345 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, Reader handoffs, or the lower continuation from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer a small `RecallWorkspace.tsx` adjustment plus narrow-breakpoint `frontend/src/index.css` updates if the leading evidence and the lower bundle need a cleaner shared wrapper for a true evidence-flow fusion
  - treat this as one visibly broader focused-Graph bundle: avoid splitting the leading card and lower continuation into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the leading evidence and the lower continuation need a cleaner shared evidence-flow wrapper
- `frontend/src/index.css`
  - preserve the calmer focused `Graph` hierarchy and the new Stage 345 follow-on readability gains
  - reduce the stacked-destination feel between the leading grounded-evidence preview and the lower continuation
  - make the full right lane read more like one guided evidence flow beside Reader instead of one hero card above one calmer bundle
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 345/346 focused-Graph crops unless the evidence-flow fusion needs one adjusted crop that better captures the shared leading-and-follow-on body

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 347/348 Windows Edge harness files
- run the Stage 347 Windows Edge validation harness against the live localhost app before the Stage 348 audit

## Exit Criteria
- At `820x980`, the focused `Graph` `Node detail` rail reads as one calmer evidence flow beside Reader rather than a leading destination card above a separate continuation bundle.
- Stage 347 makes another clearly noticeable focused `Graph` change at a glance, not just a hard-to-spot density reduction.
- Focused `Graph` evidence, confirm/reject semantics, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads or whether another surface becomes the clearer narrow-width blocker.
