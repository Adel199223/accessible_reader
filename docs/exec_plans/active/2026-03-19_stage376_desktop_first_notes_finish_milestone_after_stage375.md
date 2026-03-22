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

## Stage 376 Baseline Findings
- The current wide-desktop Stage 375 baseline still opens on an empty-state-heavy `Notes` view:
  - the left browse rail is mostly header copy, filters, and a single empty-state card when the selected source has no notes
  - the detail stage is dominated by the `Selected source` hero plus a three-card `1 / 2 / 3` instruction grid, so it still reads like guidance instead of a working desk
  - once a note is active, the detail dock still breaks into three similarly weighted support cards, which keeps the side rail louder than it needs to be beside the editable note body
- There is no dedicated Stage 376/377 Playwright harness pair yet; the repo still only has the earlier Stage 361/362 Notes scripts plus the broader Stage 375 audit.

## Implementation Direction
1. **Wide desktop first**
   - Strengthen the browse rail with a current-source glance so low-density note states still feel like an active source desk.
   - Replace the instruction-heavy empty detail state with a denser selected-source workspace summary and concise next-step guidance.
   - Keep source reopen, promotion, and context support, but regroup them so the editable note body stays more dominant than the dock.
2. **Focused/narrow adaptation second**
   - Reuse the same hierarchy after the wide-desktop direction is settled, especially for source summary, empty-state guidance, and calmer dock weight.
   - Do not create a separate micro-language for focused or narrow Notes.
3. **Audit third**
   - Add the missing Stage 376 milestone harness plus the pre-staged Stage 377 audit harness, then run the milestone validation with wide desktop captures first and focused regressions second.

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
