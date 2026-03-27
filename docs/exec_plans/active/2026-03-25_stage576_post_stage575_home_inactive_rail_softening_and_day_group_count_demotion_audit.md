# ExecPlan: Stage 576 Post-Stage-575 Home Inactive-Rail Softening And Day-Group Count Demotion Audit

## Summary
- Audit the Stage 575 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that inactive rail rows now read less carded and that day-group counts have moved out of the visible header while remaining available accessibly.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - closed toolbar cluster
  - open sort popover
  - left collection rail at rest
  - `Add Content` tile

## Acceptance
- The audit states clearly whether Stage 575 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether inactive rail rows now behave more like quiet tree/list entries than outlined cards.
- The audit records whether visible day-group counts are retired while group count context stays present in accessibility.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 575/576 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 575/576 files

## Outcome
- Complete.
- The audit confirmed that Stage 575 reduced the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: inactive rail rows now read like quieter tree/list entries, visible day-group counts are gone, and source-count context survives in accessibility instead of visible header chrome.
- Live Stage 576 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text, `2` inactive rail rows with transparent at-rest background and border, `0` visible day-group count nodes, `Sat, Mar 14, 2026, 3 sources` as the first day-group aria-label, a preserved `215.19px` add-tile height, a preserved `182px` sort-popover width, `...` as the organizer trigger text, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- `Graph` and original-only `Reader` refreshed without a new blocker, and generated-content `Reader` work remained locked.
