# ExecPlan: Stage 249 Narrower-Width Focused Notes Empty-Detail Lane Collapse After Stage 248

## Summary
- Use the March 17, 2026 Stage 248 audit as the handoff point for the next bounded benchmark slice.
- Switch surfaces because the fresh audit says the bundled focused `Study` right-lane correction succeeded overall and the next remaining narrower-width mismatch is now focused `Notes`.

## Problem Statement
- Stage 247 and Stage 248 reduced the focused `Study` right lane without destabilizing the neighboring focused surfaces.
- At `820x980`, focused `Notes` still reserves a full right `Note detail` column when no note is active, even though that lane often shows little more than an empty-state label.
- The Stage 237 visual deflation helped, but after the newer focused `Graph` and focused `Study` corrections the structural width cost of that empty right lane now stands out more clearly beside Reader.

## Goals
- Stop spending a full narrow-width support column on the empty focused `Notes` detail state while Reader is open beside it.
- Keep note browsing, note activation, note editing, and Reader handoff behavior intact.
- Preserve the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 245 focused `Graph` gains, and Stage 247 focused `Study` gains.

## Non-Goals
- Do not change backend APIs, note storage/edit/delete behavior, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into `Home`, `Graph`, `Study`, `Reader`, or another broad focused-split rewrite.
- Do not regress the selected-note state where a real note detail panel should still remain visible and usable.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped structure and CSS changes that only affect focused `Notes` when no note is active
  - collapse or absorb the empty detail state into calmer nearby chrome rather than merely repainting the same full-width blank column again
  - keep the left notes rail and Reader column stable while removing wasted structural width on the empty right lane
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Notes` empty-detail rendering only if a small wrapper or conditional structure change is needed to collapse the empty state at the targeted breakpoint
- `frontend/src/index.css`
  - tune focused `Notes` empty-detail layout and breakpoint behavior while preserving the active-note detail experience
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - keep focused `Notes` structure expectations aligned if the empty-detail layout changes
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and `Notes` handoffs aligned if the focused `Notes` empty-detail structure changes
- repo-owned Edge harness
  - add a narrower-width focused `Notes` validation capture set before the Stage 250 audit pass if the current Stage 248 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 249 Windows Edge harness to capture narrower-width focused `Notes` and surrounding reader-led states intentionally before the Stage 250 audit

## Exit Criteria
- At the targeted narrower desktop width, focused `Notes` no longer spends a full empty right column beside Reader when no note is active.
- Reader stays clearly primary while note browse, note activation, edit, delete, and Reader handoffs remain intact.
- The Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 245 focused `Graph` gains, and Stage 247 focused `Study` gains remain intact.
- The next audit can judge whether any remaining narrower-width focused-work mismatch still materially leads after the focused `Notes` empty-detail lane collapse.
