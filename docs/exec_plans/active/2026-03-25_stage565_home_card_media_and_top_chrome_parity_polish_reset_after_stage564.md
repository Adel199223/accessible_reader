# ExecPlan: Stage 565 Home Card-Media And Top-Chrome Parity Polish Reset After Stage 564

## Summary
- Keep the Stage 563 Home structure intact while polishing the remaining high-leverage visual mismatch against the March 25, 2026 Recall homepage screenshot.
- Retire the visible in-canvas heading block so the first-screen chrome reads primarily as the compact top-right `Search` / `Add` / `List` / `Sort` cluster.
- Replace the generic Home card placeholder art with source-aware poster treatments derived only from existing document metadata.

## Scope
- Wide-desktop `Home` only.
- Touched areas:
  - Home canvas accessible labeling and visible top-chrome hierarchy
  - Home board-card poster treatments for `web`, `paste`, and file/document sources
  - Home card body hierarchy and quieter collection chip continuation
  - Stage 37 component assertions
  - Stage 565/566 Edge validation harnesses
- Explicitly out of scope:
  - backend or storage schema changes
  - thumbnail extraction or preview persistence
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind
  - `Notes`
  - `Study`

## Acceptance
- Wide-desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas.
- The visible in-canvas heading block is retired from the left side of the toolbar.
- The visible first-screen toolbar still stays limited to `Search`, `Add`, `List`, and `Sort`.
- `web` cards show hostname-aware poster treatment from `source_locator`.
- `paste` cards show a local-capture poster treatment.
- file/document cards show file-format poster treatment from `source_type` and `file_name`.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 565/566 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 565 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 565/566 files

## Outcome
- Complete.
- Wide-desktop `Home` now keeps the Stage 563 selected-collection rail and date-grouped canvas, but the visible `Captures` heading block is retired from the toolbar so the first-screen chrome reads primarily as the compact top-right utility cluster.
- Home board cards now use metadata-only poster treatments instead of decorative placeholder boxes: `web` cards render hostname-aware poster branding, `paste` cards render a local-capture poster, and file/document cards render a file-format poster keyed from `source_type` plus `file_name`.
- Live Stage 565 Edge validation recorded `Captures` as the active rail label, `Captures collection canvas` as the canvas aria-label, `0` visible toolbar heading nodes, `4` visible toolbar controls, a `288px` `Add Content` tile height, a `127.0.0.1` web poster detail line, and `at_tariq_86_pronoun_research_v3.html` as the representative file-poster detail.

## Next
- Stage 566 is complete, so roadmap and handoff docs should now treat Stage 566 as the current Home audit checkpoint and Stage 565 as the latest implementation checkpoint while returning `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
