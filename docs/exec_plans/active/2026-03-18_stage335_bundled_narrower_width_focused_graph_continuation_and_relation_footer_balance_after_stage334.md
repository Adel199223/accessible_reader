# ExecPlan: Stage 335 Bundled Narrower-Width Focused Graph Continuation And Relation Footer Balance After Stage 334

## Summary
- Use the March 18, 2026 Stage 334 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 333 succeeded overall and materially improved the readability of the right rail, but focused `Graph` still appears to be the lead narrow-width blocker.
- Keep the next step broad enough to matter: this stage should balance the lower continuation rows and the `Relations` footer together instead of reopening one tiny seam at a time.
- Keep the result obviously noticeable at a glance so the next audit evaluates another meaningful bundle, not a micro-adjustment.

## Problem Statement
- Stage 333 made focused `Graph` meaningfully more readable: the right rail is wider, the leading grounded-evidence preview is easier to scan, and the same-source continuation no longer reads like a tiny unreadable utility seam.
- The fresh Stage 334 capture shows that the remaining mismatch has shifted lower in the rail. The top of the lane is closer now, but the lower continuation rows still accumulate as a compact stacked follow-on and the `Relations` footer still lands too much like a tiny label at the bottom.
- Reader should remain primary, but the lower half of the focused `Graph` rail still needs better pacing so the full `Node detail` flow reads like one calm readable continuation instead of a readable top followed by a cramped tail.
- Because the user explicitly asked for significant, visible progress, Stage 335 should remain bundled. If the lower-half balance is not visibly improved at a glance, it is the wrong slice.

## Goals
- Keep the focused `Graph` `Node detail` rail subordinate to Reader while making the lower continuation and `Relations` footer feel calmer and more legible at `820x980`.
- Preserve the improved Stage 333 leading-preview readability while reducing the stacked feel of the later same-source continuation.
- Give the `Relations` footer a more readable continuation entry instead of a tiny bottom label.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, Stage 331 focused `Graph` gains, and the new Stage 333 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, confidence cues, relation context, validation actions, or Reader handoffs from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the lower continuation or the `Relations` footer needs a more explicit localized hook
  - treat this as one visibly broader lower-half balance bundle: avoid splitting continuation pacing and `Relations` footer readability into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the lower continuation block or the `Relations` footer needs a clean targeted selector
- `frontend/src/index.css`
  - preserve the Stage 333 top-rail and leading-preview readability gains
  - reduce the stacked density of the lower same-source continuation rows without returning to micro-utility text
  - make the `Relations` footer feel like a readable continuation entry instead of a tiny bottom label
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized readability hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 333/334 focused-Graph rail crops unless the lower continuation or `Relations` footer needs one slightly adjusted crop that better captures the bottom half of the rail

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 335/336 Windows Edge harness files
- run the Stage 335 Windows Edge validation harness against the live localhost app before the Stage 336 audit

## Exit Criteria
- At `820x980`, the focused `Graph` `Node detail` rail still reads as a support rail beside Reader, and the lower continuation plus `Relations` footer no longer feel like a cramped stacked tail.
- Stage 335 makes another clearly noticeable focused `Graph` change at a glance, not just a hard-to-spot seam reduction.
- Focused `Graph` evidence, validation actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the lower-half balance pass or whether another surface becomes the clearer next blocker.
