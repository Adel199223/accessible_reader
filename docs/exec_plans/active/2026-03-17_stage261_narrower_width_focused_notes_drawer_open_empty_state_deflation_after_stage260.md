# ExecPlan: Stage 261 Narrower-Width Focused Notes Drawer-Open Empty State Deflation After Stage 260

## Summary
- Use the March 17, 2026 Stage 260 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Stay on focused `Notes` because Stage 259 succeeded overall, but the next remaining mismatch is still localized inside the same surface: the drawer-open empty browse state at `820x980`.

## Problem Statement
- Stage 259 reduced the default focused `Notes` empty rail without destabilizing the neighboring focused surfaces.
- At `820x980`, the same source-focused `Notes` flow still feels too tall once the user clicks `Show` to browse notes and no note exists yet.
- The open browse state now leads more than it should because helper copy, filter controls, and the blank-state card stack up before the mostly empty `Note detail` panel settles into view.

## Goals
- Reduce the visual and structural weight of the drawer-open focused `Notes` empty browse state at the narrower breakpoint.
- Keep source selection, note search, empty-state guidance, and existing browse semantics intact while making the state feel more transitional and less like a full competing management panel.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, and Stage 259 focused `Notes` empty-rail gains.

## Non-Goals
- Do not change backend APIs, note storage/edit/delete behavior, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not remove the source chooser, note search input, or no-note guidance from the drawer-open browse state.
- Do not widen this pass into a broad Notes redesign across all breakpoints or a cross-surface split rewrite.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped changes in `frontend/src/index.css` first, with a small markup adjustment in `RecallWorkspace.tsx` only if the drawer-open empty state needs a calmer narrow-only grouping hook
  - flatten helper copy and blank-state framing before shrinking real browse affordances
  - keep the Stage 259 default empty rail calmer while reducing the weight of the drawer-open empty state
- `frontend/src/components/RecallWorkspace.tsx`
  - add a narrow-only hook or grouping wrapper for the drawer-open empty Notes browse state only if needed to separate compact controls from the empty-state card
- `frontend/src/index.css`
  - tighten drawer-open Notes toolbar, filter stack, and empty-state card emphasis at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Notes` structure expectations aligned if the drawer-open empty grouping changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and Notes browsing expectations aligned if the drawer-open empty structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Notes` drawer-open validation capture set before the Stage 262 audit pass if the current Stage 260 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 261 Windows Edge harness to capture narrower-width focused `Notes` drawer-open empty-state behavior intentionally before the Stage 262 audit

## Exit Criteria
- At the targeted narrower desktop width, the drawer-open focused `Notes` empty browse state no longer reads like a tall competing management column when no notes exist yet.
- Source selection, note search, no-note guidance, and current focused-source continuity remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 249 focused `Notes` empty-detail-lane gains, Stage 251 focused overview gains, Stage 253 focused `Study` left-rail gains, Stage 255 focused `Graph` gains, Stage 257 focused `Study` gains, and Stage 259 focused `Notes` empty-rail gains remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still materially leads after the drawer-open focused `Notes` follow-up.
