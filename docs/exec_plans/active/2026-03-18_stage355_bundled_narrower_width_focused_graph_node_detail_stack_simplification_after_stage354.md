# ExecPlan: Stage 355 Graph-First Desktop-Led Redesign Milestone After Stage 354

## Summary
- Replace the old seam-by-seam narrow focused `Graph` continuation with one desktop-led Graph milestone.
- Treat wide desktop `Graph` as the primary visual benchmark again, then adapt the same hierarchy into focused/narrow `Graph`, then run one milestone audit.
- Keep the work frozen to `Graph` unless a shared shell adjustment is strictly required by the redesign.

## Why This Reset Exists
- The user correctly flagged that the recent roadmap drift made progress hard to see in the UI they are judging.
- After Stage 222, benchmark pressure shifted almost entirely to narrower-width focused mode at `820x980`, so wide desktop `Graph`, `Study`, and `Notes` stayed visually close to older desktop captures even while the roadmap kept moving.
- This is not a wrong-port issue: `127.0.0.1:8000` and the current WSL IP serve the same app.
- The next correct move is not another smaller focused-Graph trim. It is a visibly different end-to-end Graph redesign.

## Milestone Rules
- Stop alternating one tiny implementation slice and one full audit.
- Finish `Graph` properly before hopping to `Study`, `Notes`, or `Home`.
- Make wide desktop the primary visual truth for this milestone.
- Use internal checkpoints inside Stage 355 instead of new numbered micro-stages:
  1. desktop Graph redesign
  2. focused/narrow Graph adaptation
  3. milestone-ready validation before the full Stage 356 audit
- If two internal Graph passes still look seam-level or subtle, stop and revise the design direction before doing more.

## Problem Statement
- Wide desktop `Graph` still reads like a bracketed browse tool: a standing quick-pick rail on the left, a persistent detail card on the right, and a canvas squeezed between them.
- The right `Node detail` area still stacks evidence as separate mini-panels instead of one integrated inspection flow.
- Same-source evidence repetition still dominates the surface more than source continuity.
- Focused/narrow `Graph` was over-optimized separately, which created a different hierarchy language instead of inheriting one clearer Graph system.

## Goals
- Make wide desktop `Graph` obviously different at a glance from the current Stage 354 and user-provided screenshots.
- Make the graph canvas the dominant surface.
- Replace the current small left rail plus standing right detail-card feel with:
  - a lighter utility/filter strip on the left
  - a compact default node peek
  - an expandable detail tray or dock for deeper inspection
- Remove the stacked support-tower feel from `Node detail`.
- Fold `about`, `Mentions`, and the leading grounded clue into one integrated evidence flow.
- Keep confirm/reject plus `Show` / `Reader` / source handoffs in one calmer action seam.
- Move secondary evidence and relations into one quieter continuation area instead of multiple boxed mini-panels.
- Make focused/narrow `Graph` inherit the same hierarchy after the desktop redesign is settled.

## Non-Goals
- Do not change backend APIs, graph extraction, confirm/reject semantics, search behavior, persistence, continuity behavior, or Reader generation logic.
- Do not redesign `Study`, `Notes`, or `Home` as part of this milestone unless a shared shell adjustment is strictly required by the new Graph hierarchy.
- Do not preserve the current Graph layout just because it already exists; major redesign is explicitly allowed here.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - redesign browse-mode `Graph` layout/state composition around a canvas-dominant desktop structure
  - replace the standing right overlay model with a calmer peek-to-detail dock/tray hierarchy
  - simplify grouped evidence rendering so repeated same-source evidence defaults to a quieter continuation treatment
  - adapt focused/narrow `Graph` to the same hierarchy after the desktop shape is settled
- `frontend/src/index.css`
  - restyle desktop `Graph` as the primary visible redesign target
  - introduce one shared Graph visual language that desktop and focused/narrow views both use
  - remove stale or superseded Graph-only hooks if they become dead weight during the redesign
- `frontend/src/App.test.tsx`
  - update browse-mode `Graph` expectations to the new desktop-first structure
  - keep route continuity and source-handoff coverage intact
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - update focused/narrow `Graph` structural expectations after the hierarchy is adapted
- `scripts/playwright`
  - replace the stale Stage 355 narrow-only assumption with:
    - one dedicated desktop Graph redesign harness
    - one focused/narrow Graph adaptation harness if needed during checkpoint 2
    - Stage 356 full milestone audit harness

## Internal Checkpoints

### Checkpoint 1: Desktop Graph Redesign
- Target the wide desktop browse Graph route first.
- Required output:
  - clearly different desktop Graph screenshots
  - targeted Graph browse tests
  - lint + build + route continuity checks
- Acceptance rule:
  - the before/after must be obviously different at a glance; if it still looks like the old left-rail/right-card composition, revise before moving on

### Checkpoint 2: Focused/Narrow Graph Adaptation
- Adapt focused/narrow `Graph` to the desktop hierarchy rather than continuing a separate narrow-only language.
- Required output:
  - targeted focused-Graph tests
  - focused/narrow Graph screenshots
  - verification that Reader handoff, source opening, and confirm/reject still work

### Checkpoint 3: Milestone-Ready Validation
- Before the full audit, confirm the Graph redesign is stable enough to audit once rather than through more micro-iterations.
- Required output:
  - green targeted tests
  - lint/build
  - `git diff --check`
  - harness syntax checks

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 355/356 Windows Edge harness files
- run a dedicated desktop Graph screenshot harness before the full audit
- run a focused/narrow Graph regression harness before the full audit if the desktop-first redesign changes focused Graph structure

## Exit Criteria
- Wide desktop `Graph` looks obviously different from the current user screenshots and the Stage 222-era desktop captures.
- The canvas clearly dominates browse mode.
- The left Graph utility area no longer reads like a standing selector rail.
- The right Graph inspection area no longer reads like a stacked support tower.
- Focused/narrow `Graph` inherits the same hierarchy instead of preserving a separate micro-language.
- The milestone is ready for one honest Stage 356 audit instead of another chain of seam-only follow-ups.
