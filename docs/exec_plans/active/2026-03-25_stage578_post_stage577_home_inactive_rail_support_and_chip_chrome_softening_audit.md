# ExecPlan: Stage 578 Post-Stage-577 Home Inactive-Rail Support And Chip Chrome Softening Audit

## Summary
- Audit the Stage 577 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that inactive rail support lines now sit quieter and that the remaining small-pill chrome reads lighter without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - closed toolbar cluster
  - left collection rail at rest
  - representative board card

## Acceptance
- The audit states clearly whether Stage 577 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether inactive rail support lines now read quieter than the Stage 575 baseline.
- The audit records whether rail count pills and board card chips now read lighter without disappearing.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 577/578 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 577/578 files

## Outcome
- Complete.
- The audit confirmed that Stage 577 reduced the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: inactive rail support lines now read quieter, the remaining rail count-pill chrome is lighter, and board-card collection chips no longer pull as much attention from the poster and title.
- Live Stage 578 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text, inactive rail support styling at `9.76px` with `rgba(186, 198, 218, 0.42)`, inactive count-pill styling at `8.96px` with `rgba(210, 221, 240, 0.38)`, board-card chip styling at `8px` with `rgba(202, 214, 235, 0.5)`, `2` inactive rail rows, `0` visible day-group count nodes, `...` as the organizer trigger text, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- `Graph` and original-only `Reader` refreshed without a new blocker, and generated-content `Reader` work remained locked.
