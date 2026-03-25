# ExecPlan: Stage 561 Home Grouped-Overview Footer Count Retirement And Accessible Total Preservation Reset After Stage 560

## Summary
- Continue the wide-desktop `Home` grouped-overview parity ladder from the completed Stage 560 audit.
- Retire the visible grouped-overview footer count treatment so the `Show all ...` continuation reads more like a lighter lane cue, while preserving source-total context in accessibility.
- Keep the Stage 537 dominant `Captures` lane, the Stage 549 earlier board start, the Stage 551 attached footer treatment, the Stage 557 row-metadata simplification, and the Stage 559 hidden header-count chip intact.

## Scope
- Wide-desktop grouped-overview `Home` only.
- Touched areas:
  - grouped-overview footer button labeling and accessible total preservation
  - grouped-overview footer styling hooks
  - grouped-overview footer assertions in the Stage 37 test
  - Stage 561/562 Edge validation harnesses
- Explicitly out of scope:
  - selected-group board or list mode changes
  - organizer rail behavior
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind

## Acceptance
- The grouped-overview `Captures` footer no longer shows the visible source total in the continuation button label.
- The grouped-overview footer still preserves source-total context in accessibility after the visible count retires.
- The quieter footer label holds without regressing the Stage 551 attached-footer treatment, the Stage 557 row-metadata simplification, the Stage 559 hidden header-count chip, or the Stage 537 primary-lane plus secondary-stack composition.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 561/562 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 561 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 561/562 files

## Outcome
- Completed.
- Wide-desktop `Home` now retires the visible grouped-overview footer count treatment while preserving source-total context in hidden accessible footer text, and the quieter continuation label holds without regressing the Stage 551 attached-footer treatment, the Stage 557 row-metadata simplification, the Stage 559 hidden header-count chip, or the Stage 537 primary-lane composition.

## Evidence
- Validation passed with:
  - `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` on the Stage 561/562 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 561 validation against `http://127.0.0.1:8000`
- The Stage 561 validation recorded the grouped-overview footer button text `Show all captures, 30 total sources`, the visible footer label `Show all captures`, the hidden footer total `, 30 total sources`, collapsed that hidden footer total to `1px` by `1px`, held the `13.11px` `Captures` footer button height, preserved the `36.94px` maximum grouped-overview row height, preserved the `247.44px` primary-width delta, preserved the `51.06px` grouped-overview grid offset, and preserved the `47.83px` overview header height.

## Next
- If Stage 561 validates cleanly, run the paired Stage 562 audit, then roll roadmap and handoff docs forward only if the audit stays green.
