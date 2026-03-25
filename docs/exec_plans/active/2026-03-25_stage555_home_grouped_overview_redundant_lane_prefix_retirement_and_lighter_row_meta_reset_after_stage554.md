# ExecPlan: Stage 555 Home Grouped-Overview Redundant Lane Prefix Retirement And Lighter Row Meta Reset After Stage 554

## Summary
- Continue the wide-desktop `Home` grouped-overview parity ladder from the completed Stage 554 audit.
- Retire redundant grouped-overview row metadata prefixes when the lane already supplies that context, and soften the compact metadata seam so rows read more like lighter working-list entries.
- Keep the Stage 537 dominant `Captures` lane, the Stage 545/547 heading seam, the Stage 551 attached footer treatment, and the Stage 553 row-height compression intact.

## Scope
- Wide-desktop grouped-overview `Home` only.
- Touched areas:
  - grouped-overview board row metadata assembly
  - grouped-overview row metadata styling
  - grouped-overview row assertions in the Stage 37 test
  - Stage 555/556 Edge validation harnesses
- Explicitly out of scope:
  - selected-group board or list mode changes
  - organizer rail behavior
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind

## Acceptance
- Grouped-overview `Captures` and `Web` rows no longer repeat redundant lane-type prefixes inside the compact metadata line when the card heading already supplies that context.
- Grouped-overview `Documents` rows still keep format-specific context in the compact metadata line so imported-file entries remain distinguishable without restoring a third text band.
- The grouped-overview metadata seam reads lighter without regressing the Stage 553 row-height compression, the Stage 551 attached footer, or the Stage 537 primary-lane plus secondary-stack composition.
- Accessible row labeling still preserves source-type context even where the visible grouped-overview metadata is shortened.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 555/556 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 555 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 555/556 files

## Outcome
- Completed.
- Wide-desktop `Home` now retires redundant visible lane prefixes from grouped-overview `Captures` and `Web` row metadata while preserving format-specific file context inside `Documents`, and the compact metadata seam is softer without regressing the Stage 553 row-height compression, the Stage 551 attached footer, or the Stage 537 primary-lane composition.

## Evidence
- Validation passed with:
  - `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` on the Stage 555/556 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 555 validation against `http://127.0.0.1:8000`
- The Stage 555 validation recorded `2` visible metadata parts in `Captures` (`Mar 13 · 2 views`), `2` visible metadata parts in `Web` (`Mar 14 · 2 views`), `3` visible metadata parts in `Documents` (`HTML · Mar 15 · 2 views`), an `83.73px` maximum `Web` compact-meta width, a `124.11px` `Documents` compact-meta width, the preserved `36.94px` maximum grouped-overview row height, the preserved `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.

## Next
- If Stage 555 validates cleanly, run the paired Stage 556 audit, then roll roadmap and handoff docs forward only if the audit stays green.
