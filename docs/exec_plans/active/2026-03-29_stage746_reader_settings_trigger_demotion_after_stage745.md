# Stage 746 - Reader Settings-Trigger Demotion After Stage 745

## Summary

- Reopen `Reader` intentionally from the completed Stage 745 baseline.
- Keep the compact reading deck, lean source strip, compact source trigger, and frozen generated outputs intact.
- Reduce the remaining at-rest control clutter above the article by demoting the active-reading `Settings` gear into the existing overflow.

## Why This Stage Exists

- Stage 745 left the default Reader source seam materially calmer, but the active reading ribbon still exposes both a standalone `Settings` gear and a separate overflow trigger beside the primary `Read aloud` action.
- In the shipped Stage 745 control-ribbon evidence, those two neighboring utility icons now read as the loudest remaining chrome above the article.
- The next highest-leverage Reader cleanup is to preserve one obvious primary reading action while letting secondary utilities live behind the same overflow surface.

## Scope

### In scope

- Remove the standalone active-reading `Settings` gear from the visible Reader ribbon.
- Keep Reader settings reachable from the existing overflow surface.
- Preserve at-rest support access for `Source`, `Notebook`, and note capture flows.
- Keep the empty-state Settings access intact when no document is open.
- Update targeted Reader tests and Playwright evidence so the calmer at-rest ribbon is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of the compact source-strip trigger or the expanded Source / Notebook workspaces.
- No changes to the Stage 740/741 idle transport behavior beyond the visible utility set.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/ControlsOverflow.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage746_reader_settings_trigger_demotion_after_stage745.mjs`
  - `scripts/playwright/stage747_post_stage746_reader_settings_trigger_demotion_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 746/747 scripts
- live Reader Stage 746/747 audits on `http://127.0.0.1:8000`
- `git diff --check`
