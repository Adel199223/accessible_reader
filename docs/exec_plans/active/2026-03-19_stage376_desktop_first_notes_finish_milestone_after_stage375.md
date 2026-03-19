# ExecPlan: Stage 376 Desktop-First Notes Finish Milestone After Stage 375

## Summary
- Stage 375 confirmed that `Reader` is materially calmer and no longer leads the unfinished user-priority queue.
- The active redesign target now moves to `Notes`, with `Graph`, `Home`, and `Reader` held as refreshed regression baselines and `Study` still parked.
- This milestone should finish the remaining wide-desktop `Notes` mismatch instead of restarting cross-surface hopping.

## Target Problem
- `Notes` is much better than the earlier browse-rail layout, but it still is not finished:
  - the browse column still reads a bit too instructional and sparse when note density is low
  - the main detail stage still spends too much area on guidance rather than a stronger working note flow
  - the right support column still competes too evenly with browse and detail when the page should feel like one note workspace
- The page should feel like an active note desk with one clear detail path and quieter supporting context.

## Implementation Direction
1. **Wide desktop first**
   - Strengthen the note detail workspace and make browse-to-detail movement feel more active than instructional.
   - Keep source reopen, promotion, and context support, but demote repeated explanatory framing.
   - Make the right context rail calmer than the main note work.
2. **Focused/narrow adaptation second**
   - Reuse the same hierarchy after the wide-desktop direction is settled.
   - Do not create a separate micro-language for focused or narrow Notes.
3. **Audit third**
   - Run one full Notes-first audit with wide desktop captures first, then focused regressions second.

## Acceptance
- Wide desktop `Notes` looks visibly more like one active note workspace than Stage 375 at a glance.
- The browse rail, detail stage, and context support no longer feel too evenly weighted.
- `Graph`, `Home`, and `Reader` remain visually stable.
- `Study` remains parked.

## Validation
- targeted frontend tests for Notes/shell work
- `npm run lint`
- `npm run build`
- `git diff --check`
- repo-owned Windows Edge Notes milestone harness
- one post-milestone audit with wide desktop first
