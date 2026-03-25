# ExecPlan: Stage 559 Home Grouped-Overview Visible Count Chip Retirement And Accessible Card Count Preservation Reset After Stage 558

## Summary
- Continue the wide-desktop `Home` grouped-overview parity ladder from the completed Stage 558 audit.
- Retire the visible grouped-overview card-header source-count chip so the lane headings read more like calmer working-lane titles, while preserving source-count context accessibly.
- Keep the Stage 537 dominant `Captures` lane, the Stage 551 attached footer treatment, the Stage 553 row-height compression, the Stage 555 lane-prefix retirement, and the Stage 557 visible `views` retirement intact.

## Scope
- Wide-desktop grouped-overview `Home` only.
- Touched areas:
  - grouped-overview card header markup and accessibility labels
  - grouped-overview card heading/count styling
  - grouped-overview assertions in the Stage 37 test
  - Stage 559/560 Edge validation harnesses
- Explicitly out of scope:
  - selected-group board or list mode changes
  - organizer rail behavior
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind

## Acceptance
- Grouped-overview `Captures`, `Web`, and `Documents` card headers no longer show the visible source-count chip.
- Source-count context remains preserved in grouped-overview accessibility labeling even where the visible chip is retired.
- The grouped-overview card-top seam reads lighter without regressing the Stage 549 lean card tops, the Stage 553 row-height compression, the Stage 551 attached footer, or the Stage 537 primary-lane plus secondary-stack composition.
- The grouped-overview row metadata and accessible row labels from Stage 555/557 remain intact.

## Validation
- `npm run test -- src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 559/560 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 559 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 559/560 files

## Outcome
- Pending.

## Evidence
- Pending.

## Next
- If Stage 559 validates cleanly, run the paired Stage 560 audit, then roll roadmap and handoff docs forward only if the audit stays green.
