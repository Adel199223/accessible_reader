# Stage 800 - Reader Compact Header-Row Fusion After Stage 799

## Summary

- Reopen `Reader` intentionally from the completed Stage 799 baseline.
- Keep the compact topbar, compact source seam, packed mode-plus-transport cluster, nearby Notebook note-chip trigger, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Collapse the remaining two-row compact Reader header into one unified header block by letting the compact source seam and compact control cluster share the same working row before the article.

## Why This Stage Exists

- Stage 798/799 removed the divider and tightened the vertical gap, but compact Reader still spends two separate header rows before the article begins.
- The next highest-value cleanup is to stop treating source identity and active reading controls like stacked chrome when they belong to the same working seam.
- The user’s latest screenshots still show the article starting lower than necessary because compact Reader keeps a source row above a second controls row.

## Scope

### In scope

- Route compact Reader mode tabs plus read-aloud controls into the compact source-header actions lane.
- Keep expanded Source and Notebook support behavior unchanged.
- Keep original-parity Reader behavior unchanged.
- Preserve note-chip Notebook handoff, source destination trigger, theme overflow, and transport behavior.
- Update focused tests and live audit metrics for the new one-row compact header behavior.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No Source or Notebook expanded-support redesign.
- No article-field sizing change.
- No topbar redesign.
- No new Reader settings or transport capabilities.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage800_reader_compact_header_row_fusion_after_stage799.mjs`
  - `scripts/playwright/stage801_post_stage800_reader_compact_header_row_fusion_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 800/801 scripts
- live Reader Stage 800/801 audits on `http://127.0.0.1:8000`
- `git diff --check`
