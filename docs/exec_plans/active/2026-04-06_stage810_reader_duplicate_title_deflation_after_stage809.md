# Stage 810 - Reader Duplicate Title Deflation After Stage 809

## Summary

- Reopen `Reader` intentionally from the completed Stage 809 baseline.
- Keep the compact topbar, shared compact header row, quiet inline `Source` trigger, speech-specific `Read aloud` pill, nearby Notebook handoff, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Retire the compact source-strip title only when it exactly repeats the first visible article heading so the pre-article lead-in stops saying the same title twice in a row.

## Why This Stage Exists

- Stage 808/809 softened the last heavy compact `Source` pill into quieter inline seam text.
- On preview-backed and similarly structured documents, the next strongest remaining Reader redundancy is the title seam itself: the source strip title and the first article heading repeat the same text back to back.
- The next highest-value cleanup is to collapse that duplication only when it is exact, while keeping source identity, reopening, and generated-mode behavior intact.

## Scope

### In scope

- Compact Reader only: hide the visible source-strip title when the first renderable article heading exactly matches the saved document title.
- Keep the compact `Source` trigger, quiet inline source metadata, nearby Notebook handoff, mode tabs, read-aloud controls, and article layout intact.
- Keep the visible source-strip title in non-duplicate cases and in expanded Reader support.
- Update focused tests, audit metrics, and live Playwright captures for duplicate-title retirement.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No source-destination behavior changes.
- No Notebook or Source support redesign.
- No changes to article text, heading generation, or mode-routing logic.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage810_reader_duplicate_title_deflation_after_stage809.mjs`
  - `scripts/playwright/stage811_post_stage810_reader_duplicate_title_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 810/811 scripts
- live Reader Stage 810/811 audits on `http://127.0.0.1:8000`
- `git diff --check`
