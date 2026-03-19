# ExecPlan: Stage 333 Bundled Narrower-Width Focused Graph Node Detail Readability Rebalance After Stage 332

## Summary
- Use the March 18, 2026 Stage 332 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 331 succeeded overall and finally made the lane hierarchy visibly calmer, but focused `Graph` still appears to be the lead narrow-width blocker.
- Escalate from hierarchy-reset-only work into a readability rebalance: this stage should make the focused `Graph` `Node detail` rail easier to scan and less micro-dense without letting it grow back into a co-equal destination panel beside Reader.
- Keep the result obviously noticeable at a glance so the next audit evaluates another meaningful bundle rather than another tiny seam trim.

## Problem Statement
- Stage 331 materially changed focused `Graph`: the right lane shell is flatter, the selected-node glance is calmer, the first source run reads more like one grouped support flow, and the rail is visibly less card-like than the Stage 330 version.
- The fresh Stage 332 capture shows that the remaining mismatch is no longer a heavy destination-panel hierarchy. Instead, the right lane now feels a bit too compressed in the wrong places: the leading grounded-evidence preview, repeated `Show` / `Open` seams, and the relation follow-on footer read as tiny micro-utilities rather than a calm readable support rail.
- Reader should remain primary, but the focused `Graph` support rail still needs better readability and hierarchy balance so it supports live reading instead of feeling either too boxed or too cramped.
- Because the user explicitly asked for significant, visible progress, Stage 333 should be another broader bundle. If the result is not visibly more readable at a glance, it is the wrong slice.

## Goals
- Keep the focused `Graph` `Node detail` rail subordinate to Reader while making it more readable and less micro-dense at `820x980`.
- Improve the readability of the leading grounded-evidence preview and the first source-run continuation without reintroducing stacked destination-card framing.
- Give action seams and repeated-source continuation rows a clearer left-to-right hierarchy so they read as readable follow-on utilities rather than tiny ledger rows.
- Make the `Relations` follow-on block feel like a calm readable continuation instead of a tiny footer label.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, and the new Stage 331 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, confidence cues, relation context, validation actions, or Reader handoffs from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the readability rebalance needs one more localized hook around the leading source run or relation follow-on footer
  - treat this as one visibly broader focused `Graph` readability bundle: avoid splitting preview, action-seam, and relation-readability work into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the leading source-run readability or relation continuation needs a clean targeted selector
- `frontend/src/index.css`
  - keep Reader visually primary while slightly rebalancing the focused `Graph` rail if the current right-lane compression is hurting readability
  - make the leading grounded-evidence preview easier to scan at a glance
  - simplify the repeated `Show` / `Open` follow-on seams so they read like one calmer utility continuation
  - make the `Relations` follow-on block more readable and less footer-like without restoring a second destination-panel feel
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized readability hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 331/332 focused-Graph rail crop unless the readability rebalance needs one slightly adjusted crop that better captures the leading preview and the follow-on relation footer together

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 333/334 Windows Edge harness files
- run the Stage 333 Windows Edge validation harness against the live localhost app before the Stage 334 audit

## Exit Criteria
- At `820x980`, the focused `Graph` `Node detail` rail still reads as a support rail beside Reader, but no longer feels overly micro-dense or cramped.
- Stage 333 makes another clearly noticeable focused `Graph` change at a glance, not just a hard-to-spot seam reduction.
- The leading grounded-evidence preview, repeated-source continuation, and `Relations` follow-on footer all read more comfortably within one calmer rail hierarchy.
- Focused `Graph` evidence, validation actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the readability rebalance or whether another surface becomes the clearer next blocker.
