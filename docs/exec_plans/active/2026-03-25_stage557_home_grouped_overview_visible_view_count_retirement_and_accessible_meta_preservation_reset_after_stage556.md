# ExecPlan: Stage 557 Home Grouped-Overview Visible View Count Retirement And Accessible Meta Preservation Reset After Stage 556

## Summary
- Continue the wide-desktop `Home` grouped-overview parity ladder from the completed Stage 556 audit.
- Retire the visible grouped-overview row `views` suffix so the compact metadata seam reads more like a lighter working-list timestamp line, while preserving view-count context in accessible labeling.
- Keep the Stage 537 dominant `Captures` lane, the Stage 551 attached footer treatment, the Stage 553 row-height compression, and the Stage 555 lane-prefix retirement intact.

## Scope
- Wide-desktop grouped-overview `Home` only.
- Touched areas:
  - grouped-overview board row metadata assembly and accessibility labels
  - grouped-overview row metadata styling
  - grouped-overview row assertions in the Stage 37 test
  - Stage 557/558 Edge validation harnesses
- Explicitly out of scope:
  - selected-group board or list mode changes
  - organizer rail behavior
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind

## Acceptance
- Grouped-overview `Captures` and `Web` rows no longer show the visible `views` suffix in the compact metadata line, leaving the timestamp as the visible metadata seam.
- Grouped-overview `Documents` rows keep file-format plus timestamp context without the visible `views` suffix.
- Accessible row labeling still preserves available-view-count context even where the visible grouped-overview metadata is shortened.
- The grouped-overview metadata seam reads lighter without regressing the Stage 553 row-height compression, the Stage 551 attached footer, or the Stage 537 primary-lane plus secondary-stack composition.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 557/558 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 557 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 557/558 files

## Outcome
- Completed.
- Wide-desktop `Home` now retires the visible grouped-overview row `views` suffix while preserving available-view-count context in row accessibility labels, and the compact metadata seam is lighter without regressing the Stage 553 row-height compression, the Stage 551 attached footer, the Stage 555 lane-prefix retirement, or the Stage 537 primary-lane composition.

## Evidence
- Validation passed with:
  - `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` on the Stage 557/558 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 557 validation against `http://127.0.0.1:8000`
- The Stage 557 validation recorded `1` visible metadata part in grouped-overview `Captures` (`Mar 13`), `1` visible metadata part in grouped-overview `Web` (`Mar 14`), `2` visible metadata parts in grouped-overview `Documents` (`HTML · Mar 15`), preserved accessible row labels such as `Open Web fallback 1773393553435 (Paste), 2 views available`, a `35.3px` `Web` compact-meta width, a `75.19px` `Documents` compact-meta width, the preserved `36.94px` maximum grouped-overview row height, the preserved `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.

## Next
- If Stage 557 validates cleanly, run the paired Stage 558 audit, then roll roadmap and handoff docs forward only if the audit stays green.
