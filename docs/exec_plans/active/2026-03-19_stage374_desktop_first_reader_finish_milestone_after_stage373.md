# ExecPlan: Stage 374 Desktop-First Reader Finish Milestone After Stage 373

## Summary
- Stage 373 confirmed that the broad `Home` finish pass succeeded and that `Home` no longer leads the unfinished priority queue.
- The active redesign target now moves to `Reader`, with `Notes` queued behind it, `Graph` and `Home` held as refreshed regression baselines, and `Study` still parked.
- This milestone should finish the remaining wide-desktop `Reader` mismatch instead of reopening cross-surface churn.

## Target Problem
- `Reader` is materially calmer than its older baseline, but it still is not finished:
  - the reading lane still competes too much with the stage shell, ribbon, and support dock
  - source and notes support still read too much like a standing workbench instead of a docked companion
  - the wide desktop route still needs one clearer document-first hierarchy at a glance
- The page should feel like one dominant reading workspace with support tucked around it, not a large card plus another co-equal task area.

## Implementation Direction
1. **Wide desktop first**
   - Make the document lane more dominant than the surrounding stage chrome.
   - Compress the top stage, keep the transport useful, and make the support area read like one calmer dock/tray.
   - Preserve `Settings`, `Add note`, source switching, note capture, and source-library access without letting them visually outrank reading.
2. **Focused/narrow adaptation second**
   - Reuse the same hierarchy after the wide-desktop direction is settled.
   - Do not invent a new micro-language for focused or narrow Reader.
3. **Audit third**
   - Run one full Reader-first audit with wide desktop captures first, then focused regressions second.

## Acceptance
- Wide desktop `Reader` looks visibly more document-first than Stage 373 at a glance.
- The dock reads as calmer support, not a co-equal second workspace.
- `Graph` and `Home` remain visually stable as refreshed baselines.
- `Notes` remains next in queue, and `Study` remains parked.

## Validation
- targeted frontend tests for Reader/shell work
- `npm run lint`
- `npm run build`
- `git diff --check`
- repo-owned Windows Edge Reader milestone harness
- one post-milestone audit with wide desktop first
