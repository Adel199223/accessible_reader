# ExecPlan: Stage 221 Home Expanded Earlier State Rebalancing After Stage 220

## Summary
- Use the March 17, 2026 Stage 220 audit as the handoff point for the next bounded benchmark slice.
- Stay on `Home` in bundled dominant-surface mode because the remaining mismatch is now localized to the expanded `Earlier` state rather than the default landing.

## Problem Statement
- Stage 219 materially improved the default `Home` landing by making the primary reopen path clearer and reducing the sense of one long archive wall.
- Stage 220 confirmed that the calmer default landing now succeeds overall and that the focused `Graph`, `Study`, `Notes`, and Reader surfaces remained stable.
- The remaining mismatch is concentrated in the expanded `Earlier` state, where the lead reopen card stays too tall beside the reopened archive tail and the expanded view recreates a narrow ledger-like archive wall.

## Goals
- Rebalance the expanded `Earlier` state so it feels like a continuation of the calmer landing instead of a stretched spotlight beside a long archive ledger.
- Keep the clearer primary reopen hierarchy on the default collapsed landing intact.
- Improve scan order and proportional balance in the expanded state without changing current Home search, add-source, resume, or focused-source entry behavior.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into `Graph`, `Study`, `Notes`, `Reader`, or the focused split layouts.
- Do not undo the Stage 219 default landing improvements by reviving a heavier spotlight or a flatter fully equalized archive wall.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - adjust the expanded `Earlier` layout and reveal-state hierarchy
- `frontend/src/index.css`
  - tune `Home`-only expanded-state spacing, proportions, and row density
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update `Home` reveal-state assertions if the expanded structure changes
- `frontend/src/App.test.tsx`
  - keep shell and focused-source continuity expectations aligned if Home reveal labels or structure shift

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 221 Windows Edge harness so the expanded `Earlier` state is captured intentionally before the Stage 222 audit

## Exit Criteria
- Expanding `Earlier` no longer leaves one oversized lead card stretched beside a narrow archive tail.
- The expanded Home state still feels like a deliberate continuation of the calmer default landing.
- The clearer Stage 219 default landing hierarchy remains intact.
- The next benchmark audit can judge whether `Home` is finally clear overall instead of being blocked by the reveal-state imbalance.
