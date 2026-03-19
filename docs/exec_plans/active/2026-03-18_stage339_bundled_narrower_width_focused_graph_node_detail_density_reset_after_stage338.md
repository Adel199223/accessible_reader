# ExecPlan: Stage 339 Bundled Narrower-Width Focused Graph Node Detail Density Reset After Stage 338

## Summary
- Use the March 18, 2026 Stage 338 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch the active surface back to focused `Graph` at `820x980`, because Stage 337 succeeded overall and the fresh audit suggests the loudest remaining narrow-width blocker is now the still-dense `Node detail` lane beside Reader.
- Keep the next step broad enough to matter: treat leading evidence preview, metadata/action seams, and same-source continuation pacing as one bundled density reset instead of reopening tiny seam edits.
- Make the change clearly visible at a glance so the next audit measures another meaningful surface correction, not a micro-adjustment.

## Problem Statement
- Stage 331, Stage 333, and Stage 335 materially improved focused `Graph`, and Stage 337 materially calmed focused `Study`, but the current Stage 338 screenshots still show the focused `Graph` `Node detail` lane reading like a compact ledger beside Reader.
- The lane is less boxed than earlier versions, yet the leading evidence preview, confirm/reject seam, repeated metadata, and same-source continuation still feel too compressed and too equal in weight.
- Reader should remain primary at `820x980`, but focused `Graph` still needs a stronger density reset so the right lane reads like one calmer support flow instead of a dense destination column.
- Because the user explicitly asked for significant, visible progress, Stage 339 should stay bundled and should not collapse into another micro edit on one chip or one action row.

## Goals
- Keep Reader clearly primary while making the focused `Graph` `Node detail` lane calmer and less ledger-like at `820x980`.
- Rebalance the leading evidence preview, metadata/action seams, and same-source continuation together so the right lane reads like one support flow.
- Improve the whole visible top-half impression in one pass, not just one tiny seam.
- Produce another clearly noticeable visual change, not a hidden micro-adjustment.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, Stage 329 focused `Graph` gains, Stage 331 focused `Graph` gains, Stage 333 focused `Graph` gains, Stage 335 focused `Graph` gains, and the new Stage 337 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, graph extraction logic, confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove graph evidence, confidence cues, relation context, validation actions, or Reader handoffs from focused `Graph`.
- Do not widen this pass into a different surface or breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the right-lane density reset needs a localized hook for a cleaner bundled selector
  - treat this as one visibly broader right-lane density pass: avoid splitting leading-preview spacing, metadata/action weight, and same-source continuation pacing into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks only if the right-lane density reset needs a more explicit narrow-breakpoint selector
- `frontend/src/index.css`
  - flatten and calm the `Node detail` top seam so it feels less like a compact utility ledger
  - enlarge or rebalance the leading evidence preview so it reads more like support content than a tiny destination card
  - reduce the visual weight of repeated metadata and action seams in the same-source continuation
  - keep `Relations` clearly secondary if it appears in the first viewport
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if another localized hierarchy or density hook is added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the current focused `Graph` top capture unless one additional node-detail crop is needed to show the density reset clearly

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 339/340 Windows Edge harness files
- run the Stage 339 Windows Edge validation harness against the live localhost app before the Stage 340 audit

## Exit Criteria
- At `820x980`, focused `Graph` still exposes the current graph workflow, but the `Node detail` lane reads as a calmer support rail beside Reader rather than a dense ledger-like destination column.
- Stage 339 makes another clearly noticeable visual change at a glance.
- Focused `Graph` evidence, validation actions, Reader handoffs, and source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the density reset or whether another surface becomes the clearer next blocker.
