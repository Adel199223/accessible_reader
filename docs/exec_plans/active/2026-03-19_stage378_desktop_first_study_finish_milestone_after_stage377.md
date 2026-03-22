# ExecPlan: Stage 378 Desktop-First Study Finish Milestone After Stage 377

## Summary
- The user explicitly approved the next recommended step after the Stage 377 hold state, so `Study` is reopened as the sole active surface.
- Finish `Study` the same way the reopened priority surfaces were finished: desktop-first, one broader milestone, then focused/narrow alignment, then one Stage 379 audit.
- Do not reopen queue-hopping. `Study` is the only active redesign target until this milestone closes.

## Why This Milestone Exists
- Stage 366/367 already moved `Study` in the right direction, but it was intentionally parked while `Graph`, `Home`, `Reader`, and `Notes` were refreshed and re-audited.
- Stage 377 then closed that reopened user-priority queue and returned the roadmap to a hold state until the user explicitly chose the next surface.
- The user has now explicitly asked to continue with the next recommended step, which reopens `Study`.
- The current wide-desktop `Study` artifact still lags the calmer family of finished surfaces and remains the next honest benchmark target once it is unlocked again.

## Milestone Rules
- Keep the milestone scoped to `Study` plus any shared shell/layout primitives strictly required by the redesign.
- Preserve study scheduling, reveal/grading semantics, queue behavior, evidence behavior, Reader handoff behavior, and all storage/search/continuity contracts.
- Keep `Graph`, `Home`, `Reader`, and `Notes` as regression baselines only.
- Keep generated Reader content behavior out of scope.
- Use internal checkpoints inside Stage 378 instead of reopening micro-stages:
  1. wide-desktop Study finish pass
  2. focused/narrow Study alignment
  3. milestone-ready validation before the full Stage 379 audit

## Problem Statement
- Wide desktop `Study` still reads too much like a broad review dashboard beside the calmer `Graph`, `Home`, `Reader`, and `Notes` surfaces.
- The active review flow, answer state, evidence stack, and queue framing still feel too segmented and roomy relative to the newer workbench-style layouts.
- The redesign needs to make the current card flow visibly primary while turning queue/support/evidence into calmer docked follow-on structure.

## Goals
- Make wide desktop `Study` feel materially calmer and more intentional than the Stage 377 baseline at first glance.
- Keep the prompt, reveal, grading, and evidence flow visually continuous and dominant.
- Demote queue and support chrome into lighter utility or dock treatment.
- Carry the same hierarchy into focused/narrow `Study` so it does not drift back into a separate micro-language.

## Non-Goals
- Do not change FSRS or review scheduling logic.
- Do not change card generation, evidence generation, grading semantics, or Reader generated-content behavior.
- Do not reopen `Graph`, `Home`, `Reader`, or `Notes` except for regression checks.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - primary target for wide and focused `Study` composition
- `frontend/src/index.css`
  - primary target for review-lane hierarchy, dock treatment, and queue/evidence demotion
- `frontend/src/App.test.tsx`
  - maintain route continuity and shell-level handoff expectations if Study shell behavior changes
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - maintain focused/narrow Study regression expectations
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extend or preserve wide desktop Study expectations if needed
- `scripts/playwright`
  - Stage 378 should include one dedicated wide-desktop Study comparison harness
  - Stage 379 should be one full benchmark audit with wide desktop surfaces first and focused regressions second

## Internal Checkpoints

### Checkpoint 1: Wide Desktop Study Finish Pass
- Start from the current Stage 377 desktop Study baseline.
- Remove the remaining boxed review-dashboard feel and make the active review lane clearly lead the workspace.
- Acceptance rule:
  - the desktop before/after must look obviously different at a glance, not like another seam-only pass

### Checkpoint 2: Focused/Narrow Study Alignment
- Carry the same hierarchy into focused/narrow `Study`.
- Keep the adaptation regression-sized but clearly aligned with the new desktop language.

### Checkpoint 3: Milestone-Ready Validation
- Confirm `Study` now belongs with the calmer priority-surface family before the Stage 379 audit.
- Keep `Graph`, `Home`, `Reader`, and `Notes` as regression-only captures in the audit.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 378/379 Windows Edge harness files
- run a dedicated wide-desktop Study comparison harness before the full audit
- rerun focused/narrow Study regression captures in the same milestone

## Exit Criteria
- Wide desktop `Study` now looks materially redesigned relative to the Stage 377 baseline and no longer reads like the remaining older dashboard surface.
- Focused/narrow `Study` inherits the same calmer hierarchy.
- `Graph`, `Home`, `Reader`, and `Notes` stay visually stable as refreshed regression baselines.
- The repo docs rotate out of the Stage 377 hold state and point to Stage 378/379 as the active path.
