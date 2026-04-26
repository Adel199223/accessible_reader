# ExecPlan: Stage 868 Home Open Board Card Scanability And Preview Differentiation After Stage 867

## Summary
- Reopen `Home` intentionally from the completed Stage 866/867 Reader short-document support-open baseline.
- Improve the organizer-visible open Home board so above-fold cards no longer scan as a repeated local-capture poster wall.
- Preserve the Stage 829-845 Home density, top-band, organizer, Matches, hidden-state, and no-clipping baselines while keeping Reader generated outputs frozen.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, reuse existing Home preview content and preview assets to add a Stage 868 preview display mode for weak/repetitive local captures.
- Keep meaningful rendered image previews available, but let local capture cards expose a text-first hybrid excerpt so the first viewport becomes easier to scan.
- In `frontend/src/index.css`, add a compact hybrid-preview treatment that preserves card height and density while making readable source text the visible owner.
- Extend Home Vitest and the shared Home Playwright audit with preview-variant, text-first, rendered-preview, and generic-local-poster metrics.

## Validation
- targeted Home/App Vitest
- `npm run build`
- backend graph pytest
- `node --check` on the shared Home harness and Stage 868/869 scripts
- live Stage 868/869 browser runs
- `git diff --check`

