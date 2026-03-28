# ExecPlan: Stage 678 Home Checklist Outline Preview Rebalance Reset After Stage 677

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Refine only the remaining checklist-outline body-rhythm mismatch inside `sheet` `content-rendered-preview` cards without reopening preview-source routing, note tiers, article-sheet work, document-outline work, shell, rail, toolbar, add-tile, board cadence, or lower-card hierarchy work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the existing top-level layout split unchanged:
  - `focus-note` for sparse-selector-driven compact note previews
  - `summary-note` for promoted short note previews
  - `sheet` for richer structured previews
- Keep the Stage 674/676 internal sheet split intact:
  - `article-sheet` remains the structured Web/article treatment
  - `document-outline` remains the structured TXT/file treatment
  - `checklist-outline` remains the structured paste checklist treatment
- Refine only the internal `checklist-outline` art:
  - slim the checklist rail and rebalance body width so task rows read less cramped in Home-card thumbnails
  - start the checklist body slightly earlier so the first task row reads more deliberately beneath the title block
  - keep the structured paste lane clearly more segmented than the TXT document-outline control
  - do not add new API fields, preview source literals, or storage tables

## Acceptance
- The representative weak Stage 10 `Web` card stays `image` / `content-rendered-preview` and keeps the Stage 674 article-sheet treatment unchanged.
- The representative TXT document card stays `image` / `content-rendered-preview` and keeps the Stage 676 document-outline treatment unchanged as the control.
- A representative longer structured paste sheet control in `Captures` remains `image` / `content-rendered-preview`, but now reads with a slimmer left checklist rail, a wider body column, and an earlier first task row while still staying more segmented than TXT.
- Sparse Stage11 focus-note and promoted Stage13 summary-note controls remain stable regression anchors.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage678_home_checklist_outline_preview_rebalance_reset_after_stage677.mjs scripts/playwright/stage679_post_stage678_home_checklist_outline_preview_rebalance_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 678/679 touched set
