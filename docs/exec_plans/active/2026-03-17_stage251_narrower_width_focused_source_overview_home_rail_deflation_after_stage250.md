# ExecPlan: Stage 251 Narrower-Width Focused Source-Overview Home-Rail Deflation After Stage 250

## Summary
- Use the March 17, 2026 Stage 250 audit as the handoff point for the next bounded benchmark slice.
- Switch surfaces because the fresh audit says the focused `Notes` empty-detail-lane correction succeeded overall and the next remaining narrower-width mismatch is now the focused source-overview `Home` rail.

## Problem Statement
- Stage 249 and Stage 250 removed the wasted empty `Notes` detail lane without destabilizing the neighboring focused surfaces.
- At `820x980`, the focused source overview still gives the left `Home` rail a full column for one small source card plus a `Show` utility even though the real task is the summary canvas to the right.
- The current state is calmer than earlier narrow shells, but after the newer `Notes`, `Study`, and `Graph` corrections the focused overview rail now stands out as the next place where support chrome feels slightly too wide and separate.

## Goals
- Reduce the visual and structural weight of the focused source-overview `Home` rail at the narrower breakpoint.
- Keep source switching and source-overview handoffs intact while letting the summary canvas feel more primary.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 245 focused `Graph` gains, Stage 247 focused `Study` gains, and Stage 249 focused `Notes` gains.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into `Graph`, `Study`, `Notes`, `Reader`, or a broad focused-source redesign.
- Do not remove the ability to jump back to broader `Home` browsing or switch sources from the focused overview path.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped structure and CSS changes that keep the focused overview route behavior unchanged while reducing left-rail weight
  - flatten or compress the focused `Home` rail and source summary card before changing the main source-overview canvas
  - keep the shared focused-source strip stable while reducing the perceived three-surface split between rail and summary
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused source-overview rail grouping only if a small wrapper or copy move is needed to support a calmer narrow hierarchy
- `frontend/src/index.css`
  - tune focused source-overview rail spacing, utility density, and card framing at the targeted breakpoint while preserving wider layouts
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused overview structure expectations aligned if the focused `Home` rail grouping changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and overview handoffs aligned if the focused overview rail structure changes
- repo-owned Edge harness
  - add a narrower-width focused overview validation capture set before the Stage 252 audit pass if the current Stage 250 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 251 Windows Edge harness to capture narrower-width focused overview and neighboring states intentionally before the Stage 252 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused source overview no longer spends a full-feeling left `Home` rail on one small source card and utility button beside the summary canvas.
- The source-overview canvas feels more clearly primary while source switching and route continuity remain intact.
- The Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 245 focused `Graph` gains, Stage 247 focused `Study` gains, and Stage 249 focused `Notes` gains remain intact.
- The next audit can judge whether any remaining narrower-width focused-work mismatch still materially leads after the focused overview rail deflation.
