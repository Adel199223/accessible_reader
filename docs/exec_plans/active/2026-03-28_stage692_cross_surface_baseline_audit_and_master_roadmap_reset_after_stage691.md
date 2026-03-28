# ExecPlan: Stage 692 Cross-Surface Baseline Audit And Master Roadmap Reset After Stage 691

## Summary
- Reopen product work after the completed Stage 690/691 notebook-placement pair, but do not jump straight into another surface redesign.
- Use Stage 692 to reset the project onto one queued roadmap that can advance milestone-by-milestone without re-deciding direction every turn.
- Ground the queue in a fresh live baseline audit across `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, `Study`, and the focused reader-led split view.

## Scope
- Refresh continuity docs so Stage 692 becomes the active implementation checkpoint and Stage 693 becomes the paired audit.
- Replace the older post-Stage-691 hold guidance with one queued milestone order:
  - Stage 694/695 shared shell and navigation reset
  - Stage 696/697 Home organizer ergonomics and clipping correction
  - Stage 698/699 embedded Notebook follow-through
  - Stage 700/701 Reader IA and shell reset across all modes
  - Stage 702/703 generated-mode Reader UX-only refinement plus invariant lock
  - Stage 704/705 Study parity reset
  - Stage 706/707 cross-surface cleanup and closeout baseline
- Record the currently known blockers explicitly:
  - shell rail remains fixed and labeled instead of icon-first and collapsible by section
  - Home still shows visible organizer seam/resize chrome and text-fit or clipping issues
  - embedded Notebook placement is correct, but still rides internal `notes` continuity aliases
  - Reader needs a dedicated UI/UX phase while generated outputs stay frozen
  - Study remains the oldest major top-level baseline
- Add a fresh cross-surface Playwright baseline harness that captures:
  - wide `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`
  - shell rail state
  - Home organizer seam and visible clipping evidence
  - focused reader-led split evidence

## Acceptance
- `AGENTS.md`, `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, `agent.md`, `docs/assistant/INDEX.md`, and `docs/ux/recall_benchmark_matrix.md` all point to the same queued roadmap.
- Stage 692 is the active implementation checkpoint, Stage 693 is the latest audit pair, and the next queued slice is Stage 694/695.
- The roadmap no longer tells future chats to stop after every pass and ask for the next step.
- The baseline audit artifacts explicitly capture the current shell/Home issues the user called out.
- `Graph` stays regression-only inside this reset; `Reader` is now UI/UX-open but generated-output-frozen in the roadmap language.

## Validation
- targeted frontend regression:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - `frontend/src/components/RecallShellFrame.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/lib/appRoute.test.ts`
  - `frontend/src/lib/graphViewFilters.test.ts`
- targeted backend regression:
  - `backend/tests/test_api.py -k graph -q`
- `frontend/npm run build`
- `node --check` for the new Stage 692/693 baseline harness pair
- real Windows Edge validation against `http://127.0.0.1:8000`
- targeted `git diff --check`

## Notes
- This checkpoint is a program reset and evidence refresh, not the shell/Home redesign itself.
- Reader generation behavior is frozen from this point forward unless the user explicitly reprioritizes generated-content work.
