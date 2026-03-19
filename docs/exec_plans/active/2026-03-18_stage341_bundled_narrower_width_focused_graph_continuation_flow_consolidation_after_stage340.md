# ExecPlan: Stage 341 Bundled Narrower-Width Focused Graph Continuation Flow Consolidation After Stage 340

## Summary
- Use the March 18, 2026 Stage 340 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Graph` at `820x980`, because Stage 339 succeeded overall and the fresh audit suggests the loudest remaining narrow-width blocker is now the long continuation flow beneath the improved leading preview beside Reader.
- Keep the next step broad enough to matter: treat the repeated follow-on excerpts, inline utility seams, and footer `Relations` pacing as one bundled continuation-flow consolidation instead of reopening tiny row edits.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not a micro-adjustment.

## Problem Statement
- Stage 339 materially improved focused `Graph`: the right lane is wider, the leading evidence preview is easier to scan, and the top utility seam is calmer.
- The fresh Stage 340 capture shows that the remaining mismatch has shifted lower in the rail. The top of the lane is better now, but the repeated follow-on excerpts still accumulate as a long text wall and the `Relations` footer still lands as a separate tail beneath it.
- Reader should remain primary at `820x980`, but focused `Graph` still needs a stronger continuation-flow reset so the whole lower lane reads like one calm support block instead of a readable top followed by a long stacked follow-on.
- Because the user explicitly asked for significant, visible progress, Stage 341 should remain bundled. If the lower continuation does not look meaningfully different at a glance, it is the wrong slice.

## Goals
- Keep the focused `Graph` `Node detail` rail subordinate to Reader while making the lower continuation and `Relations` footer feel calmer and more consolidated at `820x980`.
- Preserve the improved Stage 339 top-half readability while reducing the long-text-wall feel of the later same-source continuation.
- Make the `Relations` footer feel like a subordinate continuation entry instead of a separate trailing block.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, Stage 331 focused `Graph` gains, Stage 333 focused `Graph` gains, Stage 335 focused `Graph` gains, Stage 337 focused `Study` gains, and the new Stage 339 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, confidence cues, relation context, validation actions, or Reader handoffs from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the lower continuation or footer needs a more explicit localized hook
  - treat this as one visibly broader lower-flow bundle: avoid splitting continuation pacing and footer readability into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the lower continuation block or the `Relations` footer needs a cleaner targeted selector
- `frontend/src/index.css`
  - preserve the Stage 339 top-half readability gains
  - reduce the long-text-wall feel of the repeated follow-on excerpts and inline utility seams
  - make the lower continuation read as one grouped follow-on block rather than a stack of equivalent rows
  - make the `Relations` footer feel like a quieter continuation of the rail rather than a separate tail card
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized continuity hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 339/340 focused-Graph rail crops unless the lower continuation or `Relations` footer needs one adjusted crop that better captures the bottom half of the rail

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 341/342 Windows Edge harness files
- run the Stage 341 Windows Edge validation harness against the live localhost app before the Stage 342 audit

## Exit Criteria
- At `820x980`, the focused `Graph` `Node detail` rail still reads as a support rail beside Reader, and the lower continuation plus `Relations` footer no longer feel like a long stacked tail.
- Stage 341 makes another clearly noticeable focused `Graph` change at a glance, not just a hard-to-spot seam reduction.
- Focused `Graph` evidence, validation actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the lower-flow consolidation or whether another surface becomes the clearer next blocker.
