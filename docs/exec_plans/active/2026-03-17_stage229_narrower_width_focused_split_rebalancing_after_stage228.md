# ExecPlan: Stage 229 Narrower-Width Focused Split Rebalancing After Stage 228

## Summary
- Use the March 17, 2026 Stage 228 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction, Stage 225 Reader chrome compression, and Stage 227 focused-source strip compression intact while shifting to the focused split beneath that strip.

## Problem Statement
- Stage 227 and Stage 228 corrected the shared focused-source strip so active work starts sooner at the targeted narrower breakpoint.
- The most visible remaining narrower-width issue is now the focused `Notes`, `Graph`, and `Study` split below that strip.
- At `820x980`, those focused states still read too evenly three-column, which makes Reader feel less primary than the calmer benchmark direction wants.

## Goals
- Rebalance narrower-width focused `Notes`, `Graph`, and `Study` layouts so live reading stays clearly primary.
- Reduce the cramped equal-weight three-column feel without losing nearby support context or source-tab handoffs.
- Keep the Stage 223 shell behavior, the Stage 225 Reader gains, and the Stage 227 strip compression intact.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter source-tab destinations, focused-source routing, study scheduling behavior, graph validation behavior, or note persistence rules.
- Do not widen this pass into a broad cross-surface redesign or another shared-strip rewrite.

## Implementation Targets
- implementation note
  - prefer breakpoint-scoped layout changes in `frontend/src/index.css` first, with minimal markup changes only where a focused split wrapper needs a dedicated narrow-width modifier
  - the live `820x980` layout currently measures as roughly `222px` left rail + `264px` Reader + `280px` secondary panel, so the first correction should rebalance widths instead of rewriting focused content structure
  - keep Reader visually primary and demote tertiary support before hiding or removing any existing handoff/action
  - keep a lower-width fallback ready so a tighter two-column narrow split can still collapse cleanly below the Stage 229 target width
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust focused `Notes`, `Graph`, and `Study` wrappers only if a small markup shift is needed to support a better narrow hierarchy
- `frontend/src/index.css`
  - rebalance focused split grid templates, pane weights, and spacing at the narrower breakpoint while preserving wider layouts
- `frontend/src/App.test.tsx`
  - keep focused-source continuity and tab handoffs aligned if narrow-state wrapper structure changes
- repo-owned Edge harness
  - add a narrower-width focused split validation capture set before the Stage 230 audit pass if the current Stage 228 set is not sufficient

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallShellFrame.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 229 Windows Edge harness to capture narrower-width focused `Notes`, `Graph`, `Study`, and Reader-led states intentionally before the Stage 230 audit

## Exit Criteria
- At the targeted narrower desktop width, focused `Notes`, `Graph`, and `Study` no longer read like equal-weight three-column splits beside live reading.
- Reader stays clearly primary while nearby support context and source-tab handoffs remain intact.
- The calmer Stage 223 shell behavior, Stage 225 Reader chrome gains, and Stage 227 strip compression remain intact.
- The next audit can decide whether any remaining narrower-width focused-work mismatch still meaningfully leads after the split rebalancing.
