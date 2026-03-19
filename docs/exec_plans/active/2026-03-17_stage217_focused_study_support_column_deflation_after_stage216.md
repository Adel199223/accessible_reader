# ExecPlan: Stage 217 Focused Study Support-Column Deflation After Stage 216

## Summary
- Use the March 17, 2026 Stage 216 audit as the handoff point for the next bounded benchmark slice.
- Keep the successful Stage 215 focused-strip and Reader-dominance gains intact while reducing the remaining co-equal dashboard feel in focused `Study`.

## Problem Statement
- Stage 215 materially improved focused split-view balance, and Stage 216 confirmed that focused `Graph` and `Notes` now leave the embedded Reader clearly primary.
- The remaining mismatch is now concentrated inside focused `Study`.
- In focused `Study`, the right-side `Active card` column still stacks too many headers, tiles, controls, metadata blocks, and evidence frames at once, which makes it read like a second primary surface beside the Reader instead of calmer secondary support.

## Goals
- Keep the live Reader clearly primary in focused `Study`.
- Deflate the focused `Study` support column into a lighter, calmer support rail.
- Merge or demote repeated `Study` framing, supporting metadata, and secondary control groups without losing current actions.
- Preserve all current navigation, handoffs, study progression, evidence access, Reader anchors, and generated-view behavior.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not change study-card generation, grading behavior, FSRS state, or Reader handoff behavior.
- Do not widen this pass into Home, Graph, Notes, or a new cross-surface correction.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - tighten focused `Study` column structure and remove duplicate support framing
- `frontend/src/index.css`
  - focused `Study` support-column spacing, hierarchy, and panel-weight tuning
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - update focused `Study` structural assertions only if the support column shape changes
- `frontend/src/App.test.tsx`
  - keep focused `Study` handoff and shell continuity covered if labels or focused structure shift

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 217 Windows Edge harness if the focused `Study` audit targets change materially

## Exit Criteria
- Focused `Study` leaves the embedded Reader as the obvious primary pane.
- The `Active card` support column feels like one calmer support rail rather than a second dashboard.
- Repeated support headers, tiles, and auxiliary controls are reduced without removing current behavior.
- The next benchmark audit can judge the remaining mismatch primarily on focused `Study` support weight instead of general split-view balance.
