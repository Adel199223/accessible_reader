# ExecPlan: Stage 593 Home Preview Detail Line And Preview Note Chrome Softening Reset After Stage 592

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the preview detail line and softening the preview note chrome.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Source-aware preview shells remain visible and useful, but the right-side preview detail line reads quieter than the Stage 592 baseline.
- The lower preview note remains visible and source-aware, but its chrome reads softer than the Stage 592 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage593_home_preview_detail_line_and_preview_note_chrome_softening_reset_after_stage592.mjs scripts/playwright/stage594_post_stage593_home_preview_detail_line_and_preview_note_chrome_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 593 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 593/594 touched set

## Outcome
- Complete locally on 2026-03-26.
- The preview detail line kept the Stage 563 poster-led structure intact, but the live Stage 593 validation reduced it to `0.54` alpha at `8.64px`.
- The lower preview note remained visible and source-aware as `Saved locally`, but the live Stage 593 validation reduced it to `0.46` alpha at `8px`.
- Targeted frontend validation, live Windows Edge Stage 593 evidence, and the follow-up Stage 594 audit all passed.
