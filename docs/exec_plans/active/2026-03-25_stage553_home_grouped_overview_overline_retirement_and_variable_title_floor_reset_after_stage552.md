# ExecPlan: Stage 553 Home Grouped-Overview Overline Retirement And Variable Title Floor Reset After Stage 552

## Summary
- Continue the wide-desktop `Home` grouped-overview parity ladder from the completed Stage 552 audit.
- Remove the extra source-type overline band inside grouped-overview board rows and stop reserving a fixed two-line title floor when rows do not need it.
- Keep the Stage 537 dominant `Captures` lane, the Stage 545/547 heading seam, and the Stage 551 attached footer treatment intact.

## Scope
- Wide-desktop grouped-overview `Home` only.
- Touched areas:
  - grouped-overview board row markup
  - grouped-overview board row density styling
  - grouped-overview row assertions in the Stage 37 test
  - Stage 553/554 Edge validation harnesses
- Explicitly out of scope:
  - selected-group board or list mode changes
  - organizer rail behavior
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind

## Acceptance
- Grouped-overview board rows no longer render the visible source-type overline inside `Captures`, `Web`, or `Documents`.
- Grouped-overview titles can collapse to their natural height instead of always reserving a two-line floor, while long titles still remain clamped and legible.
- Source-type context remains available in the grouped-overview row without restoring a third text band.
- The Stage 551 footer attachment and the Stage 537 primary-lane plus secondary-stack composition remain intact.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 553/554 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 553 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 553/554 files

## Outcome
- Completed.
- Wide-desktop `Home` now retires the grouped-overview row overline band, folds source-type context into the compact metadata line, and removes the inherited fixed title `min-height` floor while preserving the Stage 551 attached footer and the Stage 537 primary-lane composition.

## Evidence
- Validation passed with:
  - `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` on the Stage 553/554 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 553 validation against `http://127.0.0.1:8000`
- The Stage 553 validation recorded `0` grouped-overview row overline nodes, a `36.94px` maximum grouped-overview row height, a `0px` maximum grouped-overview title `min-height`, a `13.3px` maximum first-row title height, the preserved `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.

## Next
- If Stage 553 validates cleanly, run the paired Stage 554 audit, then roll roadmap and handoff docs forward only if the audit stays green.
