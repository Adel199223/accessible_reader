# ExecPlan: Stage 655 Home Content-Derived Poster Preview Fidelity Reset After Stage 654

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Broaden the March 25, 2026 Recall homepage parity closeout beyond metadata-only poster treatments by using stored document-view content inside representative `Home` posters.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, schema, or type changes.
- No shell, rail, toolbar, board-width, add-tile, or lower-card structural changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- The Stage 654 poster differentiation baseline stays intact while paste, web, and file/document cards gain content-derived hero text from stored document views.
- Poster hero text for representative paste, web, and file/document cards no longer depends only on the title, hostname, or file name fallback seam.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage655_home_content_derived_poster_preview_fidelity_reset_after_stage654.mjs scripts/playwright/stage656_post_stage655_home_content_derived_poster_preview_fidelity_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 655 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 655/656 touched set

## Outcome
- Complete locally after the Stage 655 implementation pass and Stage 656 audit.
- The pass keeps the Stage 563 selected-collection rail plus day-grouped Home canvas intact and upgrades Home posters from metadata-only fallback hero text to content-derived hero text sourced from stored `DocumentView` blocks for visible paste, web, and file/document cards.
- Live Edge evidence recorded content-derived hero text for representative paste (`Debug import sentence one.`), web (`Debug harness sentence alpha.`), and file/document (`There are classical Sunni scholars who explicitly…`) cards, alongside the real file-detail seam (`at_tariq_86_pronoun_research_v3.html`).
- The implementation preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset, and preserved `4` visible toolbar controls with `0` visible day-group count nodes.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 656 audit.
