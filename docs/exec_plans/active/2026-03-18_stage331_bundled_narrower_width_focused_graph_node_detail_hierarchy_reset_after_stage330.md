# ExecPlan: Stage 331 Bundled Narrower-Width Focused Graph Node Detail Hierarchy Reset After Stage 330

## Summary
- Use the March 18, 2026 Stage 330 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 329 succeeded overall and was visibly broader, but focused `Graph` still reads like the lead narrow-width blocker.
- Escalate from seam-only deflation into a right-lane hierarchy reset: this stage should visibly change how the focused `Graph` `Node detail` rail is organized, not just trim another tiny edge.
- Keep the result obviously noticeable at a glance so the next audit evaluates a meaningful bundle, not another hard-to-see delta.

## Problem Statement
- Stage 329 materially improved focused `Graph`: Reader is visibly wider, the selected-node glance is flatter, and the leading evidence run is calmer than the Stage 328 version.
- Even after that broader pass, the focused `Graph` right lane still reads a bit too much like a separate destination column beside Reader at `820x980`.
- The remaining mismatch is no longer just one chip or one button seam; it is the overall hierarchy of the `Node detail` lane, where header, glance, `Mentions`, leading evidence, and `Relations` still feel more segmented than they should.
- Because the user explicitly flagged that recent stages felt visually invisible, Stage 331 should not reopen the micro-stage pattern. If the bundle is not visibly meaningful, it is the wrong slice.

## Goals
- Make the focused `Graph` `Node detail` lane read like one compact support rail beside Reader instead of a second destination panel.
- Further reduce segmentation between the lane header, selected-node glance, `Mentions`, the leading source-run evidence, and the start of `Relations`.
- Preserve graph evidence clarity, confidence cues, confirm/reject actions, and Reader handoffs while reducing destination-panel weight.
- Produce another clearly noticeable visual change at `820x980`, not just an incremental seam adjustment.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, Stage 327 focused `Graph` gains, and the new Stage 329 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove evidence, confidence, relation context, validation actions, or Reader handoffs from focused `Graph`.
- Do not widen this pass into a different surface or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer narrow-breakpoint changes in `frontend/src/index.css` first, but allow a small `RecallWorkspace.tsx` adjustment if the hierarchy reset needs a cleaner localized hook around the `Node detail` rail
  - treat this as one visibly broader focused `Graph` bundle: avoid splitting header/glance/leading-evidence/relations hierarchy work into separate micro-stages before the next audit
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine localized focused `Graph` hooks if needed to distinguish the top rail seam, the leading evidence run, or the start of `Relations` during the hierarchy reset
- `frontend/src/index.css`
  - continue to bias the focused split toward Reader if the right lane still holds too much width
  - flatten the `Node detail` header and selected-node glance into a calmer top seam
  - reduce the destination-panel feel at the `Mentions` to `Relations` transition
  - make the first grounded-evidence run and the lane continuation feel like one support flow rather than stacked sub-panels
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - reuse the Stage 329/330 targeted Graph crop unless the hierarchy reset needs a slightly different narrow focused-Graph capture to evaluate the full lane

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for any new Stage 331/332 Windows Edge harness files
- run the Stage 331 Windows Edge validation harness against the live localhost app before the Stage 332 audit

## Exit Criteria
- At `820x980`, the focused `Graph` `Node detail` lane no longer reads like a co-equal destination column beside Reader.
- Stage 331 makes another clearly noticeable focused `Graph` change at a glance, not just a hard-to-spot seam reduction.
- Header, glance, leading evidence, and early continuation in focused `Graph` feel more like one compact support rail before `Relations`.
- Focused `Graph` evidence, validation actions, Reader handoffs, and current focused-source continuity remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the hierarchy reset or whether another surface becomes the clearer next blocker.
