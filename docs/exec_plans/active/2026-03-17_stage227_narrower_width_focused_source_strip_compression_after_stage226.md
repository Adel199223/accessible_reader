# ExecPlan: Stage 227 Narrower-Width Focused-Source Strip Compression After Stage 226

## Summary
- Use the March 17, 2026 Stage 226 audit as the handoff point for the next bounded narrower-width follow-up slice.
- Keep the Stage 223 shell correction and Stage 225 Reader chrome compression intact while shifting to the shared focused-source strip that still leads the narrow breakpoint.

## Problem Statement
- Stage 225 and Stage 226 corrected the narrower-width Reader control stack so the active text starts higher and the transport overflow remains intact.
- The most visible remaining narrower-width issue is now the shared focused-source strip that appears above active work in Reader and other source-focused states.
- At the targeted breakpoint, the strip’s badge/title/meta/tab stack still consumes more vertical space than the calmer benchmark direction wants before the active surface begins.

## Goals
- Reduce the focused-source strip’s vertical footprint at the targeted narrower desktop width.
- Preserve source identity, summary metadata, and shared tab handoffs while making the active surface start sooner.
- Keep the Stage 223 shell behavior and Stage 225 Reader gains intact.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not alter source-tab destinations, focused-source routing, or any content-generation rules.
- Do not widen this pass into a broad shared-shell redesign or another Reader chrome rewrite.

## Implementation Targets
- implementation note
  - prefer a CSS-first pass in `frontend/src/index.css`, scoped to narrower-width focused-source states
  - the first correction should target the generic focused-source strip collapse at the narrower breakpoint before considering markup changes
  - if a two-column narrow layout is restored for the strip, add a smaller-width fallback so the change does not create a new sub-680 overflow problem
  - only touch `SourceWorkspaceFrame.tsx` if a small grouping or wrapper change is required after the first CSS pass
- `frontend/src/components/SourceWorkspaceFrame.tsx`
  - adjust the focused-source strip structure only if a small markup change is needed to support tighter narrow-width grouping
- `frontend/src/index.css`
  - rebalance focused-source strip spacing, meta, and tab density at the narrower breakpoint while preserving wider layouts
- `frontend/src/components/RecallShellFrame.test.tsx`
  - keep focused-source shell expectations aligned if strip wrappers or labels shift
- `frontend/src/App.test.tsx`
  - keep focused-source continuity aligned if the shared strip structure changes
- repo-owned Edge harness
  - add a narrower-width focused-source validation capture before the Stage 228 audit pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallShellFrame.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 227 Windows Edge harness to capture narrower-width focused-source states intentionally before the Stage 228 audit

## Exit Criteria
- At the targeted narrower desktop width, the focused-source strip occupies less vertical space before the active surface begins.
- Source identity, metadata, and shared tab handoffs remain intact and easy to scan.
- The calmer Stage 223 shell behavior and Stage 225 Reader chrome gains remain intact.
- The next audit can decide whether any remaining narrower-width mismatch still meaningfully leads after the focused-source strip compression.
