# ExecPlan: Stage 263 Narrower-Width Focused Notes Drawer-Open Empty Detail Panel Deflation After Stage 262

## Summary
- Use the March 17, 2026 Stage 262 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Notes` because Stage 261 succeeded overall, but the next remaining mismatch is still localized inside the same flow: the drawer-open empty `Note detail` panel at `820x980`.

## Problem Statement
- Stage 261 reduced the open focused `Notes` browse rail without destabilizing the neighboring focused surfaces.
- At `820x980`, the same source-focused `Notes` flow still feels too empty and oversized once the user clicks `Show` to browse notes and no note exists yet.
- The rail and filters are calmer now, but the empty `Note detail` panel still reads like a large mostly blank destination, with more header and empty chrome than the state earns when no note is active.

## Goals
- Reduce the visual and structural weight of the drawer-open empty `Note detail` panel at the narrower breakpoint.
- Keep the `Note detail` destination obvious while making the empty state feel more temporary and less like a full primary panel.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, and Stage 261 focused `Notes` drawer-open browse-empty gains.

## Non-Goals
- Do not change backend APIs, note storage/edit/delete behavior, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the drawer-open Notes browsing flow, source chooser, note search input, or the ability to select a note and open real detail.
- Do not widen this pass into another full Notes layout rewrite or a broader focused split rebalancing pass.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the drawer-open empty `Note detail` panel needs a calmer narrow-only hook
  - reduce header copy, empty-state framing, and panel weight before changing layout behavior
  - keep the Stage 261 rail/filter gains stable while making the empty detail panel feel more secondary
- `frontend/src/components/RecallWorkspace.tsx`
  - add a narrow-only hook for the drawer-open empty `Note detail` panel only if needed to support a calmer empty-state treatment
- `frontend/src/index.css`
  - tighten drawer-open empty `Note detail` spacing, helper copy, and blank-state framing at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Notes` structural expectations aligned if the drawer-open empty detail hook changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Notes browsing expectations aligned if the empty detail structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Notes` validation capture set before the Stage 264 audit pass if the current Stage 262 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 263 Windows Edge harness to capture narrower-width focused `Notes` drawer-open empty-detail behavior intentionally before the Stage 264 audit

## Exit Criteria
- At the targeted narrower desktop width, the drawer-open empty `Note detail` panel no longer reads like a large mostly blank destination when no saved note exists yet.
- Notes browse access, source selection, note search, no-note guidance, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, Stage 259 focused `Notes` empty-rail gains, and Stage 261 drawer-open browse-empty gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the empty detail-panel follow-up.
