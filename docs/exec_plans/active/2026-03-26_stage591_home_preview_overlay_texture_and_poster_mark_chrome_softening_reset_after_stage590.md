# ExecPlan: Stage 591 Home Preview Overlay Texture And Poster Mark Chrome Softening Reset After Stage 590

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the preview overlay texture and softening the poster mark chrome.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Source-aware preview shells remain visible and useful, but the preview overlay texture reads calmer than the Stage 590 baseline.
- Poster marks remain visible and source-aware, but their chrome reads softer than the Stage 590 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage591_home_preview_overlay_texture_and_poster_mark_chrome_softening_reset_after_stage590.mjs scripts/playwright/stage592_post_stage591_home_preview_overlay_texture_and_poster_mark_chrome_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 591 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 591/592 touched set

## Outcome
- Complete locally on 2026-03-26.
- The preview overlay kept the Stage 563 poster-led structure intact, but the live Stage 591 validation reduced the pseudo-overlay to `0.19` opacity with a `0.06` maximum texture alpha.
- The representative poster mark remained visible and source-aware as `ST`, but the live Stage 591 validation reduced the mark chrome to `0.22` maximum background alpha with a `0.15` border alpha.
- Targeted frontend validation, live Windows Edge Stage 591 evidence, and the follow-up Stage 592 audit all passed.
