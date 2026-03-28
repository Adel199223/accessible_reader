# Audit Plan: Stage 695 Post-Stage-694 Shared Shell And Navigation Model Reset

## Audit Focus
- Confirm that the shared shell now reads closer to Recall's icon-first navigation without regressing section continuity.
- Confirm that section-owned panels collapse and resume intentionally.
- Confirm that embedded `Notebook` placement, `Graph`, `Home`, `Study`, and original-only `Reader` remain stable after the shell reset.

## Required Evidence
- wide desktop shell + `Home`
- wide desktop shell + `Graph`
- wide desktop shell + `Study`
- embedded `Notebook`
- original-only `Reader`
- focused reader-led split regression
- shell rail crop in open and collapsed panel states

## Acceptance
- The global rail is icon-first at rest.
- At least one section-owned panel collapse/resume flow is visible and persistent.
- No visible `Notes` primary destination returns.
- The shell reset does not reopen generated-content Reader work.

## Validation
- rerun the Stage 694 validation ladder
- save fresh JSON output plus screenshots in `output/playwright/`
- end with targeted `git diff --check`
