# ExecPlan: Stage 559 Home Grouped-Overview Visible Count Chip Retirement And Accessible Count Preservation Reset After Stage 558

## Summary
- Continue the wide-desktop `Home` grouped-overview parity ladder from the completed Stage 558 audit.
- Retire the visible grouped-overview per-card source-count chip so the card header reads more like a lean section title seam, while preserving source-count context in accessible naming.
- Keep the Stage 537 dominant `Captures` lane, the Stage 549 earlier board start, the Stage 551 attached footer treatment, the Stage 553 row-height compression, and the Stage 557 visible row-metadata retirement intact.

## Scope
- Wide-desktop grouped-overview `Home` only.
- Touched areas:
  - grouped-overview card region naming and count-chip rendering
  - grouped-overview count-chip styling
  - grouped-overview card assertions in the Stage 37 test
  - Stage 559/560 Edge validation harnesses
- Explicitly out of scope:
  - selected-group board or list mode changes
  - organizer rail behavior
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind

## Acceptance
- Grouped-overview `Captures`, `Web`, and `Documents` cards no longer show the visible source-count chip in the card heading row.
- Grouped-overview card accessibility still preserves each section's source-count context after the visible chip retires.
- The quieter card heading seam holds without regressing the Stage 549 earlier board start, the Stage 551 attached footer, the Stage 553 row-height compression, the Stage 557 row-metadata simplification, or the Stage 537 primary-lane plus secondary-stack composition.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 559/560 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 559 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 559/560 files

## Outcome
- Completed.
- Wide-desktop `Home` now retires the visible grouped-overview per-card source-count chip while preserving source-count context in accessible card naming, and the quieter card-heading seam holds without regressing the Stage 549 earlier board start, the Stage 551 attached footer, the Stage 553 row-height compression, the Stage 557 row-metadata simplification, or the Stage 537 primary-lane composition.

## Evidence
- Validation passed with:
  - `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` on the Stage 559/560 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 559 validation against `http://127.0.0.1:8000`
- The Stage 559 validation recorded accessible grouped-overview card names `Captures, 30 sources`, `Web, 2 sources`, and `Documents, 2 sources`, collapsed each count chip to `1px` by `1px`, preserved `Mar 13`, `Mar 14`, and `HTML · Mar 15` row metadata, held the `36.94px` maximum grouped-overview row height, held the `13.11px` `Captures` footer button height, preserved the `247.44px` primary-width delta, preserved the `51.06px` grouped-overview grid offset, and preserved the `47.83px` overview header height.

## Next
- If Stage 559 validates cleanly, run the paired Stage 560 audit, then roll roadmap and handoff docs forward only if the audit stays green.
