# Stage 808 - Reader Compact Source Trigger Deflation After Stage 807

## Summary

- Reopen `Reader` intentionally from the completed Stage 807 baseline.
- Keep the compact topbar, shared compact header row, speech-specific `Read aloud` pill, quiet inline source meta, nearby Notebook handoff, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Retire the remaining accent-pill treatment from the compact `Source` trigger so the source seam reads more like inline reading context than a cluster of separate buttons.

## Why This Stage Exists

- Stage 806/807 already demoted the compact source-type and note-count badges into quieter inline seam context.
- The strongest remaining compact source-seam chrome is now the bright `Source` pill itself.
- The next highest-value cleanup is to keep the destination handoff and source reopen affordance intact while softening that trigger into a subtler inline text-plus-chevron control.

## Scope

### In scope

- Compact Reader only: demote the compact `Source` trigger from an accent-pill badge into a quieter inline seam trigger.
- Keep the source-destination menu, click target, keyboard accessibility, and expanded Source reopening behavior intact.
- Keep the title, source type, note-count handoff, mode tabs, read-aloud controls, and article layout unchanged.
- Update focused tests, audit metrics, and live Playwright captures for the softened compact source trigger.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No note-capture or read-aloud logic changes.
- No expanded Source-support redesign.
- No topbar or mode-strip redesign.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage808_reader_compact_source_trigger_deflation_after_stage807.mjs`
  - `scripts/playwright/stage809_post_stage808_reader_compact_source_trigger_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 808/809 scripts
- live Reader Stage 808/809 audits on `http://127.0.0.1:8000`
- `git diff --check`
