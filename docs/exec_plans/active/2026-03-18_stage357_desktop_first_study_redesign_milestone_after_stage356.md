# ExecPlan: Stage 357 Home-First Desktop-Led Redesign Milestone After Stage 356

## Summary
- Follow the completed Stage 355/356 `Graph` milestone by redesigning wide desktop `Home` as the next whole-section milestone.
- Treat wide desktop `Home` as the primary visual benchmark, then adapt the same hierarchy into focused overview and narrower desktop `Home`, then run one milestone audit.
- Keep the work frozen to `Home` unless a shared shell adjustment is strictly required by the redesign.

## Why This Milestone Exists
- The Stage 355/356 `Graph` milestone finally delivered the kind of broad visible change the user wanted and now acts as the locked desktop regression baseline.
- The user explicitly reset the remaining order to `Home -> Reader -> Notes` and froze `Study`, so the roadmap should no longer drift according to whichever surface a fresh audit happens to prefer.
- Current wide desktop `Home` still reads too much like a header card plus oversized resume card above a sparse archive tail instead of one active collection workspace.

## Milestone Rules
- Keep wide desktop as the primary visual truth for this milestone.
- Finish `Home` properly before moving to `Reader` or `Notes`.
- Use internal checkpoints inside Stage 357 instead of new numbered micro-stages:
  1. desktop `Home` redesign
  2. focused overview and narrower desktop `Home` adaptation
  3. milestone-ready validation before the full Stage 358 audit
- Audits verify the active milestone and regressions; they do not reorder the remaining queue.
- If two internal `Home` passes still look seam-level or subtle, stop and revise the structural design before doing more.

## Problem Statement
- Wide desktop `Home` still opens with too much staged shell around one oversized resume card and not enough dense, useful saved-source content above the fold.
- The in-body support/search framing competes with the shell-level `Search` and `New` actions instead of reinforcing them.
- The lower saved-source area still feels like a sparse archive tail instead of a continuation of the main reopen flow.
- Focused overview and narrower desktop `Home` should inherit the new hierarchy instead of preserving a separate micro-language.

## Goals
- Make wide desktop `Home` obviously different at a glance from the current Stage 356/user screenshots.
- Turn `Home` into one stronger resume-and-library workspace rather than a landing card plus archive.
- Keep shell-level `Search` and `New` as the primary utilities and demote or remove duplicate in-body search/add framing unless it is strictly needed.
- Use width more intentionally:
  - one dominant continue/reopen path
  - 2-4 clearly secondary nearby resumptions
  - a denser saved-source library visible much earlier above the fold
- Reduce repeated labels, oversized cards, and empty canvas.
- Adapt focused overview and narrower desktop `Home` to the same hierarchy after the desktop redesign settles.

## Non-Goals
- Do not change backend APIs, import/storage/search semantics, persistence, continuity behavior, or Reader generation logic.
- Do not widen into `Reader`, `Notes`, or `Study` redesign during this milestone.
- Do not reopen `Graph` unless the `Home` work directly regresses the completed Graph milestone.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - redesign browse-mode `Home` into one stronger collection workspace with a clearer resume-and-library flow
  - remove or demote duplicate in-body search/add framing when shell-level actions already cover the task
  - adapt focused overview and narrower desktop `Home` to the same hierarchy after the wide layout settles
- `frontend/src/index.css`
  - restyle desktop `Home` as the active visible redesign target
  - introduce one shared `Home` visual language that desktop and focused/narrow views both use
  - remove stale or superseded `Home`-only hooks if they become dead weight during the redesign
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update browse-mode `Home` expectations for the new desktop-first structure
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - update focused overview structural expectations if the narrower/focused hierarchy changes
- `frontend/src/App.test.tsx`
  - keep shell, route continuity, and cross-section navigation intact while `Home` changes
- `scripts/playwright`
  - Stage 357 should include a dedicated desktop `Home` redesign harness plus focused/narrow `Home` regression coverage
  - Stage 358 should be one full milestone audit with wide desktop surfaces first and focused regression captures second

## Internal Checkpoints

### Checkpoint 1: Desktop Home Redesign
- Target the wide desktop `Home` route first.
- Required output:
  - clearly different desktop `Home` screenshots
  - targeted `Home` browse tests
  - lint + build + route continuity checks
- Acceptance rule:
  - the before/after must be obviously different at a glance; if it still looks like the old header-card plus oversized-resume composition, revise before moving on

### Checkpoint 2: Focused Overview And Narrow Home Adaptation
- Adapt focused overview and narrower desktop `Home` to the new desktop hierarchy instead of inventing a separate micro-language.
- Required output:
  - targeted focused/narrow `Home` tests
  - focused/narrow `Home` screenshots
  - verification that `Search`, `New`, reopen actions, and source handoffs still work

### Checkpoint 3: Milestone-Ready Validation
- Before the full audit, confirm the `Home` redesign is stable enough to audit once rather than through more micro-iterations.
- Required output:
  - green targeted tests
  - lint/build
  - `git diff --check`
  - harness syntax checks

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 357/358 Windows Edge harness files
- run a dedicated desktop `Home` screenshot harness before the full audit
- run a focused overview / narrower desktop `Home` regression harness before the full audit if Stage 357 changes those structures

## Exit Criteria
- Wide desktop `Home` looks obviously different from the current user screenshots and the Stage 356 baseline.
- The active reopen flow uses wide space more intentionally and no longer reads like a staged landing card above a sparse archive.
- The saved-source library starts earlier and reads like part of one continuous collection workspace.
- Focused overview and narrower desktop `Home` inherit the same hierarchy instead of preserving a separate micro-language.
- The milestone is ready for one honest Stage 358 audit instead of another chain of seam-only follow-ups.
