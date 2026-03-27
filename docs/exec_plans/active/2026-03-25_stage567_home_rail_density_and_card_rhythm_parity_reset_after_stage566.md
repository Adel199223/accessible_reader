# ExecPlan: Stage 567 Home Rail-Density And Card-Rhythm Parity Reset After Stage 566

## Summary
- Keep the Stage 563 Home structure intact while tightening the remaining high-leverage mismatch against the March 25, 2026 Recall homepage screenshot.
- Flatten the collection rail at rest so it reads more like a light tree than a second control panel.
- Tighten the toolbar composition, `Add Content` tile, and card shells so Home reads denser without dropping source-aware poster treatment.

## Scope
- Wide-desktop `Home` only.
- Touched areas:
  - Home collection rail density and at-rest organizer overflow behavior
  - Home toolbar composition and Search/List/Sort proportions
  - Home canvas shell contrast, top padding, add-tile density, and card rhythm
  - Stage 37 component assertions
  - Stage 567/568 Edge validation harnesses
- Explicitly out of scope:
  - backend or storage schema changes
  - thumbnail extraction or preview persistence
  - routing changes
  - standalone note-creation flows
  - `Graph`
  - original-only `Reader` beyond regression refresh
  - generated-content `Reader` work of any kind
  - `Notes`
  - `Study`

## Acceptance
- Wide-desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas.
- The visible at-rest `Organizer options` block is retired in favor of a compact overflow trigger.
- The first-screen toolbar still stays limited to `Search`, `Add`, `List`, and `Sort`, but now reads as a lighter two-row cluster.
- The visible `Search` trigger reads like an input with `Search...` placeholder copy.
- The `Add Content` tile drops its helper sentence and reads denser than the Stage 565 baseline.
- `web`, `paste`, and file/document cards keep source-aware fallback media while reading denser than the Stage 565 poster treatment.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` on the Stage 567/568 harness pair
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 567 validation run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 567/568 files

## Outcome
- Complete.
- Wide-desktop `Home` now keeps the Stage 563 selected-collection rail and date-grouped canvas, but the rail reads lighter at rest: the old visible organizer block is replaced by a compact `Organizer options` trigger and the active collection continuation row is quieter and less card-like.
- The Home toolbar now reads as a lighter Recall-style two-row cluster with `Search...`, `Add`, `List`, and `Sort`, while the canvas shell, add tile, and cards all render denser than the Stage 565 pass.
- Live Stage 567 Edge validation recorded `Captures` as the active rail label, `Captures collection canvas` as the canvas aria-label, `0` visible at-rest organizer panels, `4` visible toolbar controls in a `2 + 2` row split, `Search...Ctrl+K` as the visible search trigger text, a `249.59px` `Add Content` tile height, a `196px` sort-popover width, a `122.39px` first day-group top offset, `paste` as the active first-card preview kind, and `127.0.0.1` as the representative `web` poster detail.

## Next
- Stage 568 is complete, so roadmap and handoff docs should now treat Stage 568 as the current Home audit checkpoint and Stage 567 as the latest implementation checkpoint while returning `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
