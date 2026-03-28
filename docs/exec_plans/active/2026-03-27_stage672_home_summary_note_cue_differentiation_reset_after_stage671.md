# ExecPlan: Stage 672 Home Summary-Note Cue Differentiation Reset After Stage 671

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Refine the remaining sameness inside short `summary-note` `content-rendered-preview` cards without reopening preview-source rescue, shell, rail, toolbar, add-tile, board cadence, or lower-card hierarchy work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the current tier split unchanged:
  - `focus-note` for sparse-selector-driven compact note previews
  - `summary-note` for promoted short note previews
  - `sheet` for richer structured previews
- Refine only the internal `summary-note` art:
  - derive one or two short content cues from title/body text while filtering generic preview boilerplate
  - add deterministic cue-driven accent treatment so summary-note cards feel less samey and scan more distinctly across the Home lane
  - keep `focus-note` and `sheet` compositions unchanged

## Acceptance
- The representative Stage13 Debug short note still resolves to `image` / `content-rendered-preview`, but now carries a visible content-specific cue accent rather than only the generic summary-note shell.
- A second short summary-note control in the Captures lane should also remain `image` / `content-rendered-preview`, but show a different cue treatment driven by its own content.
- Sparse Stage11 focus-note and structured `.txt` / richer `Web` controls remain stable regression anchors.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage672_home_summary_note_cue_differentiation_reset_after_stage671.mjs scripts/playwright/stage673_post_stage672_home_summary_note_cue_differentiation_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 672/673 touched set
