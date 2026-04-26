# Stage 798 - Reader Compact Header Stack Collapse After Stage 797

## Summary

- Reopen `Reader` intentionally from the completed Stage 797 baseline.
- Keep the compact topbar, compact source identity seam, packed mode-plus-transport control cluster, real-availability mode strip, nearby Notebook note-chip trigger, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Retire the remaining stacked-band feel in compact Reader so the source seam and the control cluster read as one tighter lead-in instead of two separated header sections.

## Why This Stage Exists

- Stage 796/797 successfully packed the mode tabs and `Read aloud` controls into one tighter cluster.
- The next strongest piece of visual slack is now the vertical separation above that cluster: compact Reader still shows a long source-strip divider plus extra spacing before the controls.
- The highest-value follow-through is to collapse that source-to-control stack so the article begins under one short lead-in instead of a taller two-band header.

## Scope

### In scope

- Remove the compact Reader source-strip divider treatment.
- Tighten the compact Reader source-to-control vertical spacing.
- Keep the compact source seam and compact control row aligned to the same article-adjacent lane.
- Preserve expanded Source and Notebook support behavior.
- Preserve generated-mode behavior and frozen outputs.
- Add focused tests plus live audit metrics for compact source-to-control stack density.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No source-title or metadata rewrite.
- No topbar changes.
- No Reader generated-output changes.
- No redesign of expanded Source support, Notebook workbench, or article-field sizing.
- No new controls or transport behavior changes.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage798_reader_compact_header_stack_collapse_after_stage797.mjs`
  - `scripts/playwright/stage799_post_stage798_reader_compact_header_stack_collapse_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 798/799 scripts
- live Reader Stage 798/799 audits on `http://127.0.0.1:8000`
- `git diff --check`
