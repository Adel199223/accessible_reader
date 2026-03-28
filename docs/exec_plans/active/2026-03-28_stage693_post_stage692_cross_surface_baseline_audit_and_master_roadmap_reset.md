# Audit Plan: Stage 693 Post-Stage-692 Cross-Surface Baseline Audit And Master Roadmap Reset

## Audit Focus
- Prove that the master roadmap reset is grounded in fresh evidence rather than old continuity prose.
- Refresh the current baseline captures for `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, `Study`, and the focused reader-led split view on wide desktop plus focused narrow.
- Confirm that the known blockers are visible and correctly documented before Stage 694/695 begins the shared shell reset.

## Required Evidence
- Wide desktop captures:
  - `Home`
  - shell rail crop
  - Home organizer seam crop
  - Home clipping evidence crop when present
  - `Graph`
  - embedded `Notebook`
  - original-only `Reader`
  - `Study`
- Focused capture:
  - focused reader-led Notebook split view
- Supporting metrics:
  - shell rail labels still visible
  - no shell collapse control at rest
  - Home organizer resize handle visible at rest
  - visible clipped or truncated Home text evidence count
  - notebook placement still correct
  - original-only Reader still stable

## Acceptance
- Stage 693 confirms the queue order now recorded in the docs and names Stage 694/695 as the next active redesign slice.
- Stage 693 confirms the shell and Home blockers the user described are real current-state issues.
- Stage 693 confirms embedded `Notebook` placement remains correct.
- Stage 693 confirms `Graph`, `Study`, and original-only `Reader` are stable enough to act as regression surfaces until their queued milestones reopen.

## Validation
- rerun the Stage 692 validation ladder
- save fresh JSON output plus screenshots in `output/playwright/`
- end with targeted `git diff --check`
