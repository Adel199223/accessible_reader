# Stage 744 - Reader Source-Strip Action Compaction After Stage 743

## Summary

- Reopen `Reader` intentionally from the completed Stage 743 baseline.
- Keep the compact reading deck, real-availability mode strip, idle transport compaction, and frozen generated outputs intact.
- Reduce the last detached at-rest source-strip action so the pre-article seam reads as one calmer source identity row instead of source details plus a loose right-edge trigger.

## Why This Stage Exists

- Stage 743 retired redundant source-strip metadata, but the compact Reader source strip still ends with a standalone `Open` trigger that visually reads like a second seam.
- In the current wide-desktop baseline, that detached trigger is now the loudest remaining source-strip control above the article.
- The next highest-leverage Reader cleanup is to keep Source / Notebook / Graph / Study handoff available while folding that action into the source identity seam more cleanly.

## Scope

### In scope

- Compact the at-rest Reader source-strip destination trigger so it feels attached to the source identity instead of floating as a separate right-edge action.
- Keep the compact source-destination menu behavior and expanded Source / Notebook workspaces intact.
- Preserve the compact 0.773-width source strip, compact control ribbon, note-count metadata, and visible mode strip.
- Add targeted component coverage and Playwright audit checks so the calmer source-strip action seam is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No changes to the Stage 740/741 idle transport behavior.
- No changes to the Stage 742/743 source-strip metadata reductions other than how the compact destination trigger is presented.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage744_reader_source_strip_action_compaction_after_stage743.mjs`
  - `scripts/playwright/stage745_post_stage744_reader_source_strip_action_compaction_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader/source-strip coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 744/745 scripts
- live Reader Stage 744/745 audits on `http://127.0.0.1:8000`
- `git diff --check`
