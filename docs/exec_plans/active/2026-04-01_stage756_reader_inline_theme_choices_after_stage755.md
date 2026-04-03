# Stage 756 - Reader Inline Theme Choices After Stage 755

## Summary

- Reopen `Reader` intentionally from the completed Stage 755 baseline.
- Keep the compact reading deck, lean source strip, nearby Notebook note-chip trigger, and frozen generated outputs intact.
- Retire the final active-reading overflow quick action so the overflow becomes one compact control surface with inline theme choices plus read-aloud controls.

## Why This Stage Exists

- Stage 755 left active Reader materially calmer, but the overflow still spent its only quick-action slot on `Theme`.
- The active-reading theme path no longer needs a separate trigger when the only retained choices are still `Light` and `Dark`.
- The next highest-leverage cleanup is to remove that last quick-action layer and expose theme choices inline inside `More reading controls`.

## Scope

### In scope

- Retire the active-reading overflow `Theme` action.
- Add an inline `Reading theme` group with `Light` and `Dark` inside the active Reader overflow.
- Keep `Voice` and `Rate` in the same overflow.
- Keep the empty-state Reader `Theme` access intact where it still earns its place.
- Update targeted Reader tests and Playwright evidence so the inline-theme model is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of the source-strip `Source` trigger or the nearby Notebook note-chip trigger.
- No change to the compact reading-band widths or the visible mode strip.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ControlsOverflow.tsx`
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage756_reader_inline_theme_choices_after_stage755.mjs`
  - `scripts/playwright/stage757_post_stage756_reader_inline_theme_choices_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 756/757 scripts
- live Reader Stage 756/757 audits on `http://127.0.0.1:8000`
- `git diff --check`
