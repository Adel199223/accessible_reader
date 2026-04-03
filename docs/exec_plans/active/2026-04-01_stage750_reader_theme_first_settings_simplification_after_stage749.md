# Stage 750 - Reader Theme-First Settings Simplification After Stage 749

## Summary

- Reopen `Reader` intentionally from the completed Stage 749 baseline.
- Keep the compact reading deck, lean source strip, compact source trigger, idle transport compaction, and frozen generated outputs intact.
- Retire the heavy multi-section Reader settings drawer and keep only the setting that still clearly earns space in Reader: theme selection.

## Why This Stage Exists

- Stage 749 left the at-rest Reader surface materially calmer, but the remaining `Settings` entry still opens a broader Reader-specific control surface than the user needs.
- The latest user feedback is explicit: Reader should not keep a large settings payload unless the remaining controls clearly earn their place, and dark/light-style theme choice is the one obvious keeper.
- The next highest-leverage cleanup is to remove the bulky Reader settings model, leave document mode selection on the visible Reader tabs, and preserve only a lightweight theme choice path.

## Scope

### In scope

- Replace the Reader `Settings` entry with a lighter `Theme` control path in both empty and active reading states.
- Remove the multi-section settings drawer from Reader.
- Keep document mode selection on the visible Reader tabs instead of duplicating it inside any panel.
- Preserve `Voice` and `Rate` as read-aloud controls rather than generic settings.
- Keep theme selection reachable even when no document is open.
- Update targeted Reader tests and Playwright evidence so the simplified settings model is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of the compact source-strip trigger or the expanded Source / Notebook workspaces.
- No change to the visible at-rest Reader ribbon.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.
- No backend changes to stored setting semantics; keep the existing `soft` / `high` values and map them to cleaner user-facing labels.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ThemePanel.tsx`
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/ControlsOverflow.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage750_reader_theme_first_settings_simplification_after_stage749.mjs`
  - `scripts/playwright/stage751_post_stage750_reader_theme_first_settings_simplification_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 750/751 scripts
- live Reader Stage 750/751 audits on `http://127.0.0.1:8000`
- `git diff --check`
