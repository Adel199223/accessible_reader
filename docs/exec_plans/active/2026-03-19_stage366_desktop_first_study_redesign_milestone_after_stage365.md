# ExecPlan: Stage 366 Desktop-First Study Redesign Milestone After Stage 365

## Summary
- The user explicitly approved the next recommended step after the Stage 365 hold state, so `Study` is now unfrozen and becomes the next active surface.
- Redesign `Study` the same way the priority surfaces were redesigned: desktop-first, one broader milestone, then focused/narrow adaptation, then one audit.
- Do not reopen queue-hopping. `Study` is the only active redesign target until this milestone closes.

## Why This Milestone Exists
- `Study` was intentionally frozen while `Graph`, `Home`, `Reader`, and `Notes` were redesigned and consolidated.
- The user has now explicitly asked to continue with the recommended next step, which was to unfreeze `Study`.
- `Study` still visually lags the newer surfaces on wide desktop and should now inherit the same stronger hierarchy instead of remaining as the older boxed review dashboard.

## Milestone Rules
- Keep the milestone scoped to `Study` plus any shared shell/layout primitives strictly required by the redesign.
- Preserve study scheduling, review/grading semantics, queue behavior, evidence behavior, Reader handoff behavior, and all storage/search/continuity contracts.
- Keep `Graph`, `Home`, `Reader`, and `Notes` as regression baselines only.
- Keep generated Reader content behavior out of scope.
- Use internal checkpoints inside Stage 366 instead of reopening micro-stages:
  1. wide-desktop Study redesign
  2. focused/narrow Study adaptation
  3. milestone-ready validation before the full Stage 367 audit

## Problem Statement
- Wide desktop `Study` still reads too much like a boxed review dashboard next to the newer calmer surfaces.
- The current `Review card` stage, utility cluster, evidence area, and queue framing still feel more segmented and panel-heavy than `Graph`, `Home`, `Reader`, and `Notes`.
- The redesign needs to make the active review flow clearly primary while turning queue/support/evidence into calmer follow-on structure.

## Goals
- Make wide desktop `Study` feel like one active review workspace rather than a dashboard page.
- Keep the prompt/reveal/rating/evidence flow visually continuous and dominant.
- Demote queue and support chrome into lighter utility or dock treatment.
- After the desktop redesign is settled, align focused/narrow `Study` to the same hierarchy instead of carrying a separate micro-language.

## Non-Goals
- Do not change FSRS or review scheduling logic.
- Do not change card generation, evidence generation, grading semantics, or Reader generated-content behavior.
- Do not reopen `Graph`, `Home`, `Reader`, or `Notes` except for regression checks.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - primary target for wide and focused `Study` composition
- `frontend/src/index.css`
  - primary target for stage hierarchy, queue demotion, review flow, and support/evidence treatment
- `frontend/src/App.test.tsx`
  - maintain route continuity and shell-level handoff expectations if Study shell behavior changes
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - maintain focused/narrow Study regression expectations
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extend or preserve wide desktop Study expectations if needed
- `scripts/playwright`
  - Stage 366 should include one dedicated wide-desktop Study comparison harness
  - Stage 367 should be one full benchmark audit with wide desktop surfaces first and focused regressions second

## Internal Checkpoints

### Checkpoint 1: Wide Desktop Study Redesign
- Start from the current Stage 364 desktop Study baseline.
- Remove the lingering boxed review-dashboard feel.
- Acceptance rule:
  - the desktop before/after must look obviously different at a glance, not like another seam-only pass

### Checkpoint 2: Focused/Narrow Study Adaptation
- Carry the same hierarchy into focused/narrow Study.
- Keep the adaptation regression-sized but clearly aligned with the new desktop language.

### Checkpoint 3: Milestone-Ready Validation
- Confirm Study now belongs with the calmer priority-surface family before the Stage 367 audit.
- Keep `Graph`, `Home`, `Reader`, and `Notes` as regression-only captures in the audit.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 366/367 Windows Edge harness files
- run a dedicated wide-desktop Study comparison harness before the full audit
- rerun focused/narrow Study regression captures in the same milestone

## Exit Criteria
- Wide desktop `Study` now looks materially redesigned relative to the Stage 364 baseline and no longer reads like the remaining old dashboard surface.
- Focused/narrow `Study` inherits the same calmer hierarchy.
- `Graph`, `Home`, `Reader`, and `Notes` stay visually stable as regression baselines.
- The repo docs rotate out of the Stage 365 hold state and point to Stage 366/367 as the active path.
