# ExecPlan: Stage 329 Bundled Narrower-Width Focused Graph Leading Grounded Evidence Preview And Meta Deflation After Stage 328

## Summary
- Use the March 18, 2026 Stage 328 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Graph` in bundled dominant-surface mode at `820x980`, because Stage 327 succeeded overall but the lead narrow-width blocker still sits in the leading grounded-evidence block inside focused `Graph`.
- Widen this active slice deliberately: absorb the next 2-3 connected focused `Graph` right-lane refinements into Stage 329 before rerunning the full Stage 330 audit, instead of reopening one-delta micro-stages for each sub-seam.
- Make the Stage 329 result visibly noticeable, not just technically narrower: this bundle should materially change how the focused `Graph` right lane reads at a glance.

## Problem Statement
- Stage 327 materially calmed the focused `Graph` `Mentions` entry, leading source-run framing, and attached action seam.
- At `820x980`, focused `Graph` still reads slightly too much like a support lane competing with Reader.
- The leading grounded evidence preview and its attached metadata seam still carry too much destination-panel weight before the calmer same-source continuation begins.
- The recent Stage 321-328 cadence also became too fine-grained for the remaining work: the blocker is now localized to one small focused `Graph` cluster, but the process was still alternating full implementation/audit stages after CSS-only deltas.
- The remaining mismatch is large enough to be visible to a human at first glance, so the fix should also be large enough to be visible at first glance; another microscopic seam-only nudge would not be a good use of time.

## Goals
- Make the focused `Graph` right lane read more like one quiet support continuation beside Reader instead of a destination block at the narrower breakpoint.
- Soften the leading grounded evidence preview and its remaining metadata seam without hiding graph evidence, confidence, validation actions, or Reader handoffs.
- Batch the remaining closely related leading-card refinements in one implementation slice so the next benchmark audit happens after a meaningful bundle rather than another single-delta pass.
- Produce a clearly noticeable visual change in focused `Graph` at `820x980` by compressing the selected-node glance, flattening the leading evidence block, and integrating the immediate same-source bridge into one calmer evidence flow.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, and Stage 327 focused `Graph` gains.

## Non-Goals
- Do not change backend APIs, graph extraction or confirm/reject semantics, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove focused `Graph` evidence, confidence cues, validation actions, or Reader handoffs.
- Do not widen this pass into a shell change, a focused `Study` change, or a different breakpoint.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, but use a small markup adjustment in `RecallWorkspace.tsx` if needed to give the leading evidence block and selected-node glance clearer localized hooks
  - keep the Stage 327 focused `Graph` leading-entry and action-seam gains intact while localizing the bundle to the remaining leading grounded-evidence block that still competes with Reader
  - this bundle should absorb the remaining leading-card preview, metadata, immediate bridge/continuation seam work, and selected-node glance compaction if those seams are visually coupled in the same cluster; do not split them into new micro-stages unless the audit shows a genuinely new blocker afterward
- `frontend/src/components/RecallWorkspace.tsx`
  - add or refine narrow-only focused `Graph` hooks if the bundle needs selectors that distinguish the selected-node glance, the leading preview/meta block, and the immediate same-source bridge from the calmer continuation rows
- `frontend/src/index.css`
  - visibly compress the selected-node glance and top-of-lane rhythm at the targeted breakpoint
  - soften the remaining focused `Graph` leading grounded-evidence preview and metadata seam at the targeted breakpoint
  - flatten the immediate leading-source bridge and first continuation seam in the same Stage 329 bundle instead of promoting them into their own stage
  - reduce the destination-panel feel so the lane reads more like one quiet support continuation beside Reader
  - keep graph evidence, confidence, validation actions, and Reader handoffs obvious while demoting the leading block that still competes with Reader
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Graph` structural expectations aligned if new narrow-only hooks are added
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Graph Reader-handoff expectations aligned if the structure changes
- repo-owned Edge harness
  - add a Stage 329 validation capture set if the current Stage 327 focused `Graph` crop is no longer sufficient for the bundled pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 329 Windows Edge harness to capture the focused `Graph` leading grounded-evidence preview/meta block intentionally before the Stage 330 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Graph` leading grounded-evidence preview and its remaining metadata seam no longer read like a destination block beside Reader.
- The Stage 329 implementation absorbs the remaining tightly coupled leading-card seams that would otherwise create another one-delta micro-stage before the next benchmark audit.
- The focused `Graph` right lane is materially and visibly calmer at a glance than the Stage 328 version, not just technically tighter in isolated measurements.
- Focused `Graph` evidence, validation actions, Reader handoffs, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, Stage 253 focused `Study` gains, Stage 263 focused `Notes` drawer-open empty-detail gains, Stage 281 focused `Graph` gains, Stage 283 focused `Study` gains, Stage 285 focused `Graph` gains, Stage 287 focused `Study` gains, Stage 289 focused `Graph` gains, Stage 291 focused `Study` gains, Stage 293 focused `Graph` gains, Stage 295 focused `Graph` gains, Stage 297 focused `Graph` gains, Stage 299 focused `Graph` gains, Stage 301 focused `Graph` gains, Stage 303 focused `Graph` gains, Stage 305 focused `Graph` gains, Stage 307 focused `Graph` gains, Stage 309 focused `Graph` gains, Stage 311 focused `Graph` gains, Stage 313 focused `Graph` gains, Stage 315 focused `Graph` gains, Stage 317 focused `Graph` gains, Stage 319 focused `Graph` gains, Stage 321 focused `Study` gains, Stage 323 focused `Study` gains, Stage 325 focused `Study` gains, and Stage 327 focused `Graph` gains remain intact.
- The next audit can decide whether focused `Graph` still materially leads after the bundled leading grounded-evidence preview/meta pass or whether another surface now becomes the clearer follow-up.
