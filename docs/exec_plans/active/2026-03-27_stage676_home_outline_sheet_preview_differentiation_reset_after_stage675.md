# ExecPlan: Stage 676 Home Outline Sheet Preview Differentiation Reset After Stage 675

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Refine only the remaining sameness inside the denser `outline` branch of `sheet` `content-rendered-preview` cards without reopening preview-source routing, note tiers, article-sheet work, shell, rail, toolbar, add-tile, board cadence, or lower-card hierarchy work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the existing top-level layout split unchanged:
  - `focus-note` for sparse-selector-driven compact note previews
  - `summary-note` for promoted short note previews
  - `sheet` for richer structured previews
- Keep the Stage 674 `sheet` article split intact:
  - `article-sheet` remains the structured Web/article treatment
  - `outline-sheet` remains the structured TXT/file/paste treatment
- Refine only the internal `outline-sheet` art:
  - add a small internal outline-sheet selector so checklist-heavy structured paste content can render through an outline-led list treatment while TXT/document-like content keeps a more continuous document-led treatment
  - use stored preview lines and source kind as inputs; do not add new API fields, new preview source literals, or new storage tables
  - preserve the same overall card footprint so the Stage 615 width cadence and Stage 617 earlier board start remain locked

## Acceptance
- The representative weak Stage 10 `Web` card stays `image` / `content-rendered-preview` and keeps the Stage 674 article-sheet treatment unchanged.
- The representative TXT document card stays `image` / `content-rendered-preview`, but now reads as a more continuous document-led outline sheet instead of the same checklist-biased control used by longer structured paste cards.
- A representative longer structured paste sheet control in `Captures` remains `image` / `content-rendered-preview`, but now reads as a clearer outline/checklist-led sheet instead of sharing the same internal composition as TXT.
- Sparse Stage11 focus-note and promoted Stage13 summary-note controls remain stable regression anchors.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage676_home_outline_sheet_preview_differentiation_reset_after_stage675.mjs scripts/playwright/stage677_post_stage676_home_outline_sheet_preview_differentiation_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 676/677 touched set
