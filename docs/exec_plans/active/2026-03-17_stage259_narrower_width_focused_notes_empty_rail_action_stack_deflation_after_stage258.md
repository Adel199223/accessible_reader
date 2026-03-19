# ExecPlan: Stage 259 Narrower-Width Focused Notes Empty Rail Action Stack Deflation After Stage 258

## Summary
- Use the March 17, 2026 Stage 258 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Switch surfaces again because the fresh audit says the focused `Study` active-card-header correction succeeded overall and the next remaining narrower-width mismatch is now the focused `Notes` empty rail helper copy and action stack.

## Problem Statement
- Stage 257 and Stage 258 reduced the focused `Study` `Active card` header and prompt shell without destabilizing the neighboring focused surfaces.
- At `820x980`, focused `Notes` now stands out again beside Reader.
- The main offender is localized: when no note is active, the left `Notes` rail still spends too much vertical space on helper copy and full-size `Show` / `Browse notes` actions before the split settles into Reader-led work.

## Goals
- Reduce the visual and structural weight of the focused `Notes` empty-state rail at the narrower breakpoint.
- Keep the no-note guidance, browse access, and Reader continuity intact while letting Reader stay clearly primary.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, and Stage 257 focused `Study` active-card-header gains.

## Non-Goals
- Do not change backend APIs, note storage/edit/delete behavior, browse semantics, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into another broad focused split rewrite or a cross-surface redesign.
- Do not remove the ability to reopen saved notes, browse notes, or reach Reader from focused `Notes`.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the empty focused `Notes` rail needs a calmer narrow-only grouping hook
  - flatten the helper copy and action stack before shrinking any real browse affordance
  - keep the Reader column width and the current empty-detail-lane collapse stable while reducing the left rail's perceived prominence
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Notes` empty rail grouping only if a small wrapper or class hook is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - reduce focused `Notes` empty-rail copy spacing, button weight, and support-card emphasis at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Notes` empty-state structure expectations aligned if the rail grouping changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Notes` handoffs aligned if the empty focused `Notes` rail structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Notes` validation capture set before the Stage 260 audit pass if the current Stage 258 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 259 Windows Edge harness to capture narrower-width focused `Notes` and surrounding reader-led states intentionally before the Stage 260 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused `Notes` empty rail helper copy and action stack no longer read louder than the neighboring focused rails and panels beside Reader.
- Reader stays clearly primary while no-note guidance, notes browsing, and continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, and Stage 257 focused `Study` gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Notes` follow-up.
