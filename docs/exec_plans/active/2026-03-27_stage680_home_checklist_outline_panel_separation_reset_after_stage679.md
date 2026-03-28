# ExecPlan: Stage 680 Home Checklist Outline Panel Separation Reset After Stage 679

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Refine only the remaining checklist-outline/document-outline seam inside `sheet` `content-rendered-preview` cards without reopening preview-source routing, note tiers, article-sheet work, shell, rail, toolbar, add-tile, board cadence, or lower-card hierarchy work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the existing top-level layout split unchanged:
  - `focus-note` for sparse-selector-driven compact note previews
  - `summary-note` for promoted short note previews
  - `sheet` for richer structured previews
- Keep the Stage 674/676/678 internal sheet split intact:
  - `article-sheet` remains the structured Web/article treatment
  - `document-outline` remains the structured TXT/file treatment
  - `checklist-outline` remains the structured paste checklist treatment
- Refine only the internal `checklist-outline` art:
  - stop the full inner sheet from reading like one continuous bright slab in thumbnail view
  - keep the checklist lane darker overall, with narrower brighter task panels so the bright-panel footprint is measurably smaller than the TXT document-outline control
  - preserve the Stage 678 lighter checklist readability gain; do not regress back to the darker cramped Stage 677 state
  - do not add new API fields, preview source literals, or storage tables

## Acceptance
- The representative weak Stage 10 `Web` card stays `image` / `content-rendered-preview` and keeps the Stage 674 article-sheet treatment unchanged.
- The representative TXT document card stays `image` / `content-rendered-preview` and keeps the Stage 676 document-outline treatment unchanged as the control.
- A representative longer structured paste sheet control in `Captures` remains `image` / `content-rendered-preview`, keeps the Stage 678 lighter checklist readability, and now presents a measurably smaller bright-panel area than the TXT document-outline control while still staying denser than the weak `Web` article-sheet control.
- Sparse Stage11 focus-note and promoted Stage13 summary-note controls remain stable regression anchors.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage680_home_checklist_outline_panel_separation_reset_after_stage679.mjs scripts/playwright/stage681_post_stage680_home_checklist_outline_panel_separation_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 680/681 touched set
