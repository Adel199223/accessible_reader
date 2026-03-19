# ExecPlan: Stage 225 Narrower-Width Reader Chrome Compression After Stage 224

## Summary
- Use the March 17, 2026 Stage 224 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction intact and shift to the remaining Reader-specific mismatch at the same targeted breakpoint.

## Problem Statement
- Stage 223 and Stage 224 corrected the narrower-width Recall shell/rail reflow so the shared shell no longer expands into a bulky wrapped top-grid panel below full desktop width.
- The most visible remaining narrower-width issue is now inside `Reader`: the focused-source strip, reading-view controls, and read-aloud controls still stack into a tall header block that pushes the active text too far down the page.
- This now stands out because the shell itself stays calmer and the source-focused views remain more coherent at the same breakpoint.

## Goals
- Keep the active reading text visibly higher on the page at the targeted narrower desktop width.
- Compress Reader-specific chrome and spacing without removing important source context or Reader actions.
- Preserve source continuity, note actions, and speech controls while making the reading surface feel more immediate.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not change the behavior or generated outputs of `Original`, `Reflowed`, `Simplified`, or `Summary`.
- Do not widen this pass into a general desktop Reader redesign or a mobile-first rewrite.

## Implementation Targets
- implementation note
  - prefer a CSS-first pass in `frontend/src/index.css`, scoped to narrower-width Reader states
  - if the focused-source strip needs density changes, scope them to `.recall-workspace-reader` / Reader-owned narrow breakpoints instead of broadly changing shared source-workspace behavior
  - only touch `ReaderWorkspace.tsx` if a small wrapper or grouping change is required after the first CSS pass
- `frontend/src/components/ReaderWorkspace.tsx`
  - adjust narrower-width Reader structure only if a small markup change is needed to support tighter stacking
- `frontend/src/components/ReaderSurface.tsx`
  - only touch wrapper classes or hooks if the narrower-width reading surface needs lighter framing support
- `frontend/src/index.css`
  - rebalance narrower-width Reader spacing, card density, and header/control stacking while preserving wider layouts
- `frontend/src/components/ReaderSurface.test.tsx`
  - keep ReaderSurface expectations aligned if class names or structural hooks shift
- `frontend/src/App.test.tsx`
  - keep shell/route continuity aligned if Reader shell wrappers or labels change
- repo-owned Edge harness
  - add a narrower-width Reader-focused validation capture before the Stage 226 audit pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/ReaderSurface.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 225 Windows Edge harness to capture the narrower-width Reader states intentionally before the Stage 226 audit

## Exit Criteria
- At the targeted narrower desktop width, Reader text starts materially higher on the page and no longer feels pushed below a tall stack of support chrome.
- Focused-source context, view switching, note actions, and speech controls remain reachable without reintroducing heavy framing.
- The calmer Stage 223 shell behavior remains intact.
- The next audit can decide whether any remaining narrower-width mismatch still meaningfully leads after the Reader chrome compression.
