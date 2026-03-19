# ExecPlan: Stage 223 Narrower-Width Recall Shell Reflow Correction After Stage 222

## Summary
- Use the March 17, 2026 Stage 222 audit as the handoff point for the next bounded follow-up slice.
- Shift from the wide-desktop Home benchmark corrections to the known narrower-width Recall shell/rail reflow regression now that no wide-desktop surface clearly leads.

## Problem Statement
- Stage 221 and Stage 222 closed the remaining wide-desktop `Home` mismatch by calming both the default and expanded `Earlier` states.
- The most visible remaining UX issue is now the known narrower-width Recall shell/rail reflow regression, where the left rail and top shell can collapse into an oversized top navigation grid/panel that feels much heavier than the maximized-shell layout.
- This regression now stands out because the wide-desktop shell, Home, and focused-source states are materially calmer.

## Goals
- Keep the narrower-width Recall shell intentional and compact instead of turning into a heavy top-grid panel.
- Preserve the calmer wide-desktop shell, rail, and topbar behavior.
- Improve section navigation scan order and space usage at narrower desktop widths without changing routes, continuity, or source-focused behavior.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not reopen broad Home/Graph/Study/Notes/Reader restyling unless the responsive correction exposes a direct regression.
- Do not widen this pass into mobile-first redesign; keep it focused on the known narrower desktop-shell breakpoint problem.

## Implementation Targets
- `frontend/src/components/RecallShellFrame.tsx`
  - adjust the narrower-width shell/rail structure only if markup changes are needed
- `frontend/src/index.css`
  - rebalance Recall shell, rail, and topbar behavior at the relevant narrower-width breakpoints
- `frontend/src/App.test.tsx`
  - keep route/shell expectations aligned if any shell labels or structural wrappers change
- repo-owned Edge harness
  - add a narrower-width validation capture before the audit pass

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 223 Windows Edge harness to capture the narrower-width shell states intentionally before the Stage 224 audit

## Exit Criteria
- At the targeted narrower desktop width, the Recall rail/top shell no longer reflows into an oversized top navigation grid/panel.
- Section navigation remains easy to scan and use without crowding the active workspace.
- The calmer wide-desktop shell and source-focused states remain intact.
- The next audit can decide whether any remaining benchmark-sensitive UX gap still meaningfully leads after the responsive shell correction.
