# ExecPlan: Stage 609 Home Toolbar-Text Seam And Rail-Copy Restraint Reset After Stage 608

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by softening the top-right Search/Ctrl+K text seam and calming the remaining quiet-copy weight in the rail.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No toolbar layout, rail ownership, grouping, or organizer-behavior changes.
- No card-media or lower-card identity changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The Search label and `Ctrl+K` hint stay visible, but they read calmer than the Stage 608 baseline.
- The rail heading meta, rail summary line, selected/inactive support copy, and active child-preview label stay visible, but they read quieter than the Stage 608 baseline.
- The Stage 608 lower-card identity seam stays intact.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware card treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage609_home_toolbar_text_seam_and_rail_copy_restraint_reset_after_stage608.mjs scripts/playwright/stage610_post_stage609_home_toolbar_text_seam_and_rail_copy_restraint_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 609 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 609/610 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home surface kept the Stage 563 structure intact, but the live Stage 609 validation softened the Search/Ctrl+K reading seam and the remaining quiet-copy seams in the rail without reopening card or layout work.
- The toolbar and rail copy stayed fully visible while the live Stage 609 validation lowered their visible alpha against the Stage 608 baseline and preserved `4` visible toolbar controls plus `0` visible day-group count nodes.
- Targeted frontend validation, live Windows Edge Stage 609 evidence, and the follow-up Stage 610 audit all passed.
