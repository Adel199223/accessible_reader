# ExecPlan: Stage 351 Bundled Narrower-Width Focused Graph Node-Detail Rail Readability Rebalance After Stage 350

## Summary
- Use the March 18, 2026 Stage 350 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Move the active bundled dominant-surface pass back to focused `Graph` at `820x980`, because Stage 349 succeeded overall and materially calmed the focused `Study` right lane while the neighboring focused `Graph` `Node detail` rail now reads like the clearer narrow-width blocker beside Reader.
- Keep the next step broad enough to matter: rebalance the full focused `Graph` `Node detail` rail readability instead of reopening another tiny evidence-row seam.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not a hidden density-only adjustment.

## Problem Statement
- Stage 339, Stage 341, Stage 345, and Stage 347 materially improved focused `Graph`, and Stage 349 materially improved focused `Study`.
- The fresh Stage 350 capture set suggests the remaining narrow-width mismatch is now concentrated in focused `Graph`: the right `Node detail` rail still feels too cramped and text-heavy beside Reader, with the leading grounded clue, supporting continuation, and lower footer still reading more like a dense side column than one calm support flow.
- Reader should remain primary at `820x980`, but focused `Graph` still needs a broader rail readability rebalance so the whole right lane reads as a clear support rail rather than a compressed mini-ledger.
- Because the user explicitly asked for significant, visible progress, Stage 351 should remain bundled. If the focused `Graph` rail does not look meaningfully different at a glance, it is the wrong slice.

## Goals
- Keep focused `Graph` subordinate to Reader while making the full `Node detail` rail calmer and more readable at `820x980`.
- Treat rail width, leading grounded evidence, continuation rows, and the lower footer handoff as one bundled readability reset.
- Produce another clearly noticeable visual change at `820x980`, not a hidden seam-only edit.
- Preserve the calmer shell, the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 focused split balance, focused overview gains through Stage 251, focused `Notes` gains through Stage 263, focused `Graph` gains through Stage 347, focused `Study` gains through Stage 349, and current product-behavior constraints.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, `Show` / `Reader` handoffs, or focused `Relations` access from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the focused `Graph` rail needs a cleaner localized wrapper or grouping hook for a true readability rebalance
  - treat this as one visibly broader focused-Graph bundle: avoid splitting leading-card, continuation-row, and footer treatment into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the right-lane rail grouping needs cleaner targeted selectors
- `frontend/src/index.css`
  - preserve the calmer focused `Graph` hierarchy gains from Stage 347
  - reduce the cramped side-column feel of the focused `Graph` rail
  - make the full right lane read more like one calm support rail beside Reader instead of a dense evidence ledger
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 349/350 focused-Graph top crops unless the bundled readability rebalance needs one adjusted crop that better captures the whole right rail

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 351/352 Windows Edge harness files
- run the Stage 351 Windows Edge validation harness against the live localhost app before the Stage 352 audit

## Exit Criteria
- At `820x980`, the focused `Graph` right lane reads as one calmer readable support rail beside Reader instead of a cramped dense side column.
- Stage 351 makes another clearly noticeable focused `Graph` change at a glance, not just a hard-to-spot seam reduction.
- Focused `Graph` evidence, confirm/reject actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads or whether another surface becomes the clearer next blocker.
