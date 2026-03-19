# ExecPlan: Stage 370 Desktop-First Graph Finish Milestone After Stage 369

## Summary
- Stage 369 confirmed that `Graph` is still the most unfinished of the user-priority surfaces on wide desktop.
- The next broad milestone stays on `Graph` only, with `Home`, `Reader`, and `Notes` held as regression baselines behind it and `Study` parked again.
- This milestone should finish the remaining wide-desktop `Graph` mismatch instead of restarting narrow-only or cross-surface churn.

## Target Problem
- `Graph` still spends too much canvas-adjacent space on stacked chrome:
  - a broad top banner with stats and label chips
  - a heavy left browse rail with too much boxed selector weight
  - a standing `Node detail` dock that still reads like a co-equal panel instead of a calmer inspect tray
- The canvas is improved versus the pre-reset state, but it is not yet clearly dominant enough at first glance.

## Implementation Direction
1. **Wide desktop first**
   - Collapse the top banner into a lighter title-and-utility seam.
   - Slim the left browse rail into one clearer filter/selection strip with less card framing and fewer always-visible status pills.
   - Recast `Node detail` into a calmer inspect dock/tray:
     - quieter top metadata
     - one primary evidence preview
     - one tighter action seam
     - secondary evidence and relations demoted beneath the main clue instead of reading like a second stage
2. **Focused/narrow adaptation second**
   - Reuse the same hierarchy after the desktop direction is settled.
   - Do not revive the old focused-only micro-language.
3. **Audit third**
   - Run one full Graph-first audit with wide desktop captures first, then focused regressions second.

## Acceptance
- Wide desktop `Graph` looks visibly calmer and more canvas-first than Stage 369 at a glance.
- The left rail, banner, and node-detail chrome no longer compete equally with the canvas.
- `Home`, `Reader`, and `Notes` remain visually stable.
- `Study` remains parked and untouched except for regression capture if a shared-shell change requires it.

## Validation
- targeted frontend tests for Graph/shell work
- `npm run lint`
- `npm run build`
- `git diff --check`
- repo-owned Windows Edge Graph milestone harness
- one post-milestone audit with wide desktop first
