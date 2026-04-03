# Stage 754 - Reader Notebook Trigger Relocation After Stage 753

## Summary

- Reopen `Reader` intentionally from the completed Stage 753 baseline.
- Keep the compact reading deck, lean source strip, theme-first settings model, idle transport compaction, and frozen generated outputs intact.
- Retire the duplicate compact overflow `Notebook` action by promoting the source-strip note chip into the nearby Notebook trigger.

## Why This Stage Exists

- Stage 753 removed the duplicate overflow `Source` action, but the compact overflow still carried `Notebook` even though nearby notes already have a visible place in the source seam.
- Removing `Notebook` outright would weaken the local reading-plus-notes flow, so the higher-leverage cleanup is to move that entry onto the note-count chip that is already visible in the source strip.
- The next highest-value pass is to let the source seam own nearby Notebook access while leaving the overflow focused on Reader-only controls.

## Scope

### In scope

- Remove the direct `Notebook` action from the compact Reader overflow.
- Turn the source-strip note chip into the direct nearby Notebook trigger.
- Preserve Notebook and Source support access inside the expanded Reader support dock.
- Keep `Theme`, `Voice`, and `Rate` in the overflow.
- Update targeted Reader/source-strip tests and Playwright evidence so the relocated Notebook trigger is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of Source / Notebook tabs once the Reader support dock is open.
- No theme-model changes beyond proving the Stage 751 contract still holds.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage754_reader_notebook_trigger_relocation_after_stage753.mjs`
  - `scripts/playwright/stage755_post_stage754_reader_notebook_trigger_relocation_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `AGENTS.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader/source-strip coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 754/755 scripts
- live Reader Stage 754/755 audits on `http://127.0.0.1:8000`
- `git diff --check`
