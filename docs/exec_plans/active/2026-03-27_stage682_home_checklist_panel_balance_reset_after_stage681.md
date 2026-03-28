# ExecPlan: Stage 682 Home Checklist Panel Balance Reset After Stage 681

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Refine only the remaining checklist/article/document balance seam inside `sheet` `content-rendered-preview` cards without reopening preview-source routing, note tiers, article-sheet structure, document-outline structure, shell, rail, toolbar, add-tile, board cadence, or lower-card hierarchy work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the existing top-level layout split unchanged:
  - `focus-note` for sparse-selector-driven compact note previews
  - `summary-note` for promoted short note previews
  - `sheet` for richer structured previews
- Keep the Stage 674/676/680 internal sheet split intact:
  - `article-sheet` remains the structured Web/article treatment
  - `document-outline` remains the structured TXT/file treatment
  - `checklist-outline` remains the structured paste checklist treatment
- Refine only the internal `checklist-outline` panel balance:
  - keep the Stage 680 separated narrower bright panel
  - slightly reduce the checklist panel height so it stops reading taller than necessary beside the article and document controls
  - slightly widen the checklist panel so it no longer feels under-filled next to the article and document controls
  - do not add new API fields, preview source literals, or storage tables

## Acceptance
- The representative weak Stage 10 `Web` card stays `image` / `content-rendered-preview` and keeps the Stage 674 article-sheet treatment unchanged.
- The representative TXT document card stays `image` / `content-rendered-preview` and keeps the Stage 676 document-outline treatment unchanged as the control.
- A representative longer structured paste sheet control in `Captures` remains `image` / `content-rendered-preview`, keeps the Stage 680 separated checklist lane, but now reads slightly wider and less tall so it better balances against the article and document controls while still staying narrower than the TXT document-outline control.
- Sparse Stage11 focus-note and promoted Stage13 summary-note controls remain stable regression anchors.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage682_home_checklist_panel_balance_reset_after_stage681.mjs scripts/playwright/stage683_post_stage682_home_checklist_panel_balance_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 682/683 touched set
