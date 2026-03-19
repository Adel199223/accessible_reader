# ExecPlan: Stage 363 Priority-Surface Baseline Consolidation After Stage 362

## Summary
- Follow the completed `Notes` milestone with one bounded cross-surface consolidation pass across the finished user-priority surfaces: `Home`, `Graph`, `Reader`, and `Notes`.
- Keep wide desktop as the primary benchmark truth, keep `Study` frozen, and use this milestone only for meaningful shared-shell/coherence fixes plus stale-scaffolding cleanup where that materially helps.
- Do not reopen the old audit-driven surface-hopping loop. The goal is to lock a coherent baseline set, not to start a new queue by accident.

## Why This Milestone Exists
- The user-priority desktop-first sequence is now complete: `Graph`, `Home`, `Reader`, and `Notes` all received materially broader redesign milestones.
- Those four surfaces are individually stronger now, but they still need one explicit post-queue pass to confirm shared rhythm, dock language, and shell coherence.
- The repo also needs one clean checkpoint that says "these are the current locked baselines" before any future reprioritization happens.

## Milestone Rules
- Keep the work limited to `Home`, `Graph`, `Reader`, `Notes`, and shared shell/layout primitives that clearly affect more than one of those surfaces.
- Do not reopen `Study` beyond regression capture.
- Do not add backend, storage, search-semantic, graph-semantic, note-semantic, or generated-content scope.
- Use internal checkpoints inside Stage 363 instead of new micro-stages:
  1. wide-desktop baseline review and shared-shell/coherence pass
  2. focused/narrow regression alignment for impacted priority surfaces
  3. milestone-ready validation before the full Stage 364 audit

## Problem Statement
- The priority surfaces no longer need section-by-section redesign, but they still need one bounded coherence pass so they read like one intentional product family instead of four separate milestone accents.
- Shared support/dock language, section transitions, and leftover one-off scaffolding may still carry milestone-specific residue.
- Without one explicit consolidation pass, future work could drift back into reactive micro-fixes or mistakenly reopen `Study`.

## Goals
- Lock `Home`, `Graph`, `Reader`, and `Notes` as the current desktop-first baselines with one calmer shared shell rhythm.
- Fix only cross-surface issues that are visible across at least two priority surfaces or that weaken handoff continuity between them.
- Remove stale temp/generated hooks, dead CSS, or superseded scaffolding if they meaningfully slow future work down.
- Keep wide desktop as the primary visual truth and keep focused/narrow regressions aligned to that shared hierarchy.

## Non-Goals
- Do not redesign `Study`.
- Do not change backend APIs, schemas, storage, graph extraction, study generation/grading, note semantics, or Reader generated-content behavior.
- Do not reopen the old narrow-only benchmark loop unless a direct regression forces it.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - only if shared shell or shared surface framing needs a bounded cross-surface cleanup
- `frontend/src/components/ReaderWorkspace.tsx`
  - only if Reader-side dock or shell coherence needs a bounded shared correction
- `frontend/src/components/SourceWorkspaceFrame.tsx`
  - only if a shared workspace-frame adjustment materially improves multiple priority surfaces
- `frontend/src/index.css`
  - primary target for shared hierarchy, shell rhythm, and baseline-coherence fixes
- `frontend/src/App.test.tsx`
  - maintain shell, route continuity, and cross-surface handoff coverage
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - maintain focused regression expectations for `Graph`, `Notes`, and shared focused shell states
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - maintain wide desktop `Home` coverage if shared changes affect it
- `scripts/playwright`
  - Stage 363 should include a dedicated wide-desktop priority-surface comparison harness
  - Stage 364 should be one full benchmark audit with wide desktop surfaces first and focused regressions second

## Internal Checkpoints

### Checkpoint 1: Wide Baseline Review
- Review the current Stage 362 wide-desktop captures for `Home`, `Graph`, `Reader`, and `Notes`.
- Only pick fixes that are visibly meaningful at a glance.
- Acceptance rule:
  - if the candidate work is only seam-level polish with no real visual leverage, do not widen the milestone with it

### Checkpoint 2: Focused/Narrow Regression Alignment
- If shared shell or dock adjustments affect focused states, align those states in the same pass.
- Keep the focused updates regression-sized, not as a new independent redesign thread.

### Checkpoint 3: Milestone-Ready Validation
- Confirm the shared baseline set is stable enough for one honest Stage 364 audit.
- Remove or leave stale scaffolding intentionally; do not let uncertainty about cleanup linger into the audit.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 363/364 Windows Edge harness files
- run a dedicated wide-desktop priority-surface comparison harness before the full audit
- rerun focused/narrow regression captures only for the surfaces actually touched by Stage 363

## Exit Criteria
- `Home`, `Graph`, `Reader`, and `Notes` still look materially improved relative to the old pre-reset desktop state and now read as one calmer product family.
- No priority surface reverts to the old heavy panel or dashboard language.
- `Study` remains frozen and regression-only.
- The repo docs, benchmark matrix, and anchor all point to the new locked-baseline set rather than the old remaining queue.
- The milestone is ready for one honest Stage 364 audit instead of another reactive micro-pass.
