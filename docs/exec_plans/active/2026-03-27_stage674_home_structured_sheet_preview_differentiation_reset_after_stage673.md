# ExecPlan: Stage 674 Home Structured Sheet Preview Differentiation Reset After Stage 673

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Refine the remaining sameness inside structured `sheet` `content-rendered-preview` cards without reopening preview-source rescue, summary-note/focus-note lanes, shell, rail, toolbar, add-tile, board cadence, or lower-card hierarchy work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the existing top-level layout split unchanged:
  - `focus-note` for sparse-selector-driven compact note previews
  - `summary-note` for promoted short note previews
  - `sheet` for richer structured previews
- Refine only the internal `sheet` art:
  - add a small internal sheet-variant selector so structured web/article content can render through an article-led sheet treatment while document/paste/file content keeps a denser outline-led sheet treatment
  - keep both paths inside the same `sheet` lane and preserve the same external card contract
  - use stored content structure plus source kind as inputs; do not add new API fields, new preview source literals, or new storage tables

## Acceptance
- The representative weak Stage 10 `Web` card stays `image` / `content-rendered-preview`, but now reads as an article-like sheet instead of the same generic document shell used by TXT and longer paste cards.
- The representative TXT document card stays `image` / `content-rendered-preview` and remains a denser outline/document sheet control.
- A representative longer structured paste sheet control in `Captures` remains `image` / `content-rendered-preview` and stays aligned with the outline/document sheet lane rather than drifting into the article treatment.
- Sparse Stage11 focus-note and promoted Stage13 summary-note controls remain stable regression anchors.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage674_home_structured_sheet_preview_differentiation_reset_after_stage673.mjs scripts/playwright/stage675_post_stage674_home_structured_sheet_preview_differentiation_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 674/675 touched set
