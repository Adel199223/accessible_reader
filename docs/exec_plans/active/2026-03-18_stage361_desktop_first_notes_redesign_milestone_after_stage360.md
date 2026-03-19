# ExecPlan: Stage 361 Notes-First Desktop-Led Redesign Milestone After Stage 360

## Summary
- Follow the completed `Reader` milestone by redesigning wide desktop `Notes` as the next whole-section milestone.
- Treat wide desktop `Notes` as the primary visual benchmark, then adapt the same hierarchy into focused/narrow `Notes`, then run one milestone audit.
- Reuse calmer support/dock primitives from the Reader milestone where that meaningfully reduces duplication.

## Why This Milestone Exists
- `Notes` is the final section in the fixed queue after `Home` and `Reader`.
- The current wide desktop `Notes` still reads like a left browse rail plus large empty detail plus strong context column instead of one clearer note workspace.
- The Reader milestone should provide calmer support primitives that can make `Notes` feel more integrated and less panel-heavy.

## Milestone Rules
- Keep wide desktop as the primary visual truth for this milestone.
- Finish `Notes` properly before reopening cross-surface prioritization.
- Use internal checkpoints inside Stage 361 instead of new numbered micro-stages:
  1. desktop `Notes` redesign
  2. focused/narrow `Notes` adaptation
  3. milestone-ready validation before the full Stage 362 audit
- Keep `Graph` as the regression baseline and `Study` as regression-only during this milestone.

## Problem Statement
- Wide desktop `Notes` still spreads attention across too many competing zones before any actual note becomes primary.
- Empty and low-content states feel especially panel-heavy, with too much space spent on shell and context rather than a clear notes workflow.
- The current right-side context support reads too strong relative to note browsing and detail.

## Goals
- Make wide desktop `Notes` obviously different from the Stage 356 baseline at a glance.
- Replace the current browse-rail plus blank-detail plus strong-context-column feel with one clearer note workspace.
- Make note browsing and note detail the primary workflow, with quieter context support.
- Keep search, edit/delete, promotion, anchored reopen, and `Open in Reader` intact.
- Adapt focused/narrow `Notes` to the same hierarchy after the desktop redesign settles.

## Non-Goals
- Do not change note storage, note search semantics, promotion semantics, persistence, continuity contracts, or Reader generation behavior.
- Do not reopen `Reader` or `Graph` redesign except for shared support primitives that the Notes milestone legitimately reuses.
- Do not unfreeze `Study`.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - redesign wide desktop `Notes` layout and note/detail/context hierarchy
  - reuse shared dock/context primitives from the Reader milestone when they reduce duplication
- `frontend/src/index.css`
  - restyle desktop and focused/narrow `Notes` for the new hierarchy
  - remove stale Notes-only hooks if they become dead weight during the redesign
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - update focused/narrow `Notes` expectations when the hierarchy changes
- `frontend/src/App.test.tsx`
  - keep shell, route continuity, note reopen, and Reader handoff flows intact
- `scripts/playwright`
  - Stage 361 should include a dedicated desktop `Notes` redesign harness plus focused/narrow `Notes` regression coverage
  - Stage 362 should be one full milestone audit with wide desktop surfaces first and focused regression captures second

## Internal Checkpoints

### Checkpoint 1: Desktop Notes Redesign
- Target the wide desktop `Notes` route first.
- Required output:
  - clearly different desktop `Notes` screenshots
  - targeted `Notes` tests
  - lint + build + route continuity checks
- Acceptance rule:
  - the before/after must be obviously different at a glance; if it still looks like the old three-zone panel stack, revise before moving on

### Checkpoint 2: Focused/Narrow Notes Adaptation
- Adapt focused/narrow `Notes` to the new desktop hierarchy instead of keeping a separate micro-language.
- Required output:
  - targeted focused/narrow `Notes` tests
  - focused/narrow `Notes` screenshots
  - verification that search, edit/delete, promotion, anchored reopen, and `Open in Reader` still work

### Checkpoint 3: Milestone-Ready Validation
- Before the full audit, confirm the `Notes` redesign is stable enough to audit once rather than through more micro-iterations.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 361/362 Windows Edge harness files
- run a dedicated desktop `Notes` screenshot harness before the full audit
- run a focused/narrow `Notes` regression harness before the full audit if Stage 361 changes those structures

## Exit Criteria
- Wide desktop `Notes` looks obviously different from the Stage 356 baseline.
- Note browse/detail flow is clearly primary over surrounding context chrome.
- Context support is calmer and more subordinate.
- Focused/narrow `Notes` inherit the same hierarchy.
- The milestone is ready for one honest Stage 362 audit instead of more micro-stages.
