# Stage 812 - Reader Compact Source-Type Selective Retirement After Stage 811

## Summary

- Reopen `Reader` intentionally from the completed Stage 811 baseline.
- Keep the compact topbar, shared compact header row, quiet inline `Source` trigger, speech-specific `Read aloud` pill, nearby Notebook handoff, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Retire the low-signal compact `PASTE` source-type label at rest while preserving informative imported-source labels such as `HTML`.

## Why This Stage Exists

- Stage 810/811 removed the duplicated compact source-strip title when the article already starts with the same heading.
- The next strongest remaining low-value chrome in the common default Reader case is the inline `PASTE` label.
- `PASTE` adds little orientation for a local at-rest reading seam, while imported-source types such as `HTML` still help disambiguate source provenance when the title is hidden or when the source is less obvious.

## Scope

### In scope

- Compact Reader only: suppress the visible inline source-type label when the active document is paste-backed.
- Keep the visible source-type label for imported or otherwise informative source types such as `HTML`.
- Keep the nearby note-count handoff visible and unchanged.
- Keep expanded Source/Notebook support unchanged.
- Update focused tests, audit metrics, and live Playwright captures for selective compact source-type retirement.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No Source destination or Notebook behavior changes.
- No broader source-seam redesign beyond selective low-signal source-type retirement.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage812_reader_compact_source_type_selective_retirement_after_stage811.mjs`
  - `scripts/playwright/stage813_post_stage812_reader_compact_source_type_selective_retirement_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 812/813 scripts
- live Reader Stage 812/813 audits on `http://127.0.0.1:8000`
- `git diff --check`
