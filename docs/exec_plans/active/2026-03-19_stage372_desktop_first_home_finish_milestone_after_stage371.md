# ExecPlan: Stage 372 Desktop-First Home Finish Milestone After Stage 371

## Summary
- Stage 371 confirmed that the Graph finish pass succeeded and that `Graph` no longer leads the unfinished user-priority queue.
- The active redesign target now moves to `Home`, with `Reader` and `Notes` queued behind it, `Graph` held as a refreshed regression baseline, and `Study` still parked.
- This milestone should finish the remaining wide-desktop `Home` mismatch instead of reopening cross-surface churn.

## Target Problem
- `Home` is materially better than the old landing, but it still is not finished:
  - the upper workspace still reads a little too card-led instead of like one active collection stage
  - the primary continue path and nearby resumptions can still feel too separated from the denser saved-source library below
  - the lower library flow still needs to arrive sooner and read less like a follow-on archive tail
- The page should feel like an active working collection, not a redesigned landing that still transitions into a quieter archive.

## Implementation Direction
1. **Wide desktop first**
   - Tighten the top `Home` workspace into one clearer continue-and-library stage.
   - Keep shell-level `Search` and `New` primary; do not reintroduce duplicate in-body utility framing unless it is strictly needed.
   - Strengthen the visible relationship between:
     - one dominant continue/reopen path
     - a small set of nearby resumptions
     - a denser saved-source library visible earlier above the fold
   - Reduce any remaining oversized card feel, repeated labeling, or empty-canvas staging.
2. **Focused/narrow adaptation second**
   - Reuse the same hierarchy after the wide-desktop direction is settled.
   - Do not invent a separate micro-language for focused overview or narrower `Home`.
3. **Audit third**
   - Run one full Home-first audit with wide desktop captures first, then focused regressions second.

## Acceptance
- Wide desktop `Home` looks visibly more like one active collection workspace than Stage 371 at a glance.
- The continue path, nearby resumptions, and saved-source library feel like one flow instead of a staged landing handing off into an archive tail.
- `Graph`, `Reader`, and `Notes` remain visually stable.
- `Study` remains parked and untouched except for regression capture if a shared-shell change requires it.

## Validation
- targeted frontend tests for Home/shell work
- `npm run lint`
- `npm run build`
- `git diff --check`
- repo-owned Windows Edge Home milestone harness
- one post-milestone audit with wide desktop first
