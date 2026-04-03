# Stage 790 - Reader Document-Open Topbar Compaction After Stage 789

## Summary

- Reopen `Reader` intentionally from the completed Stage 789 baseline.
- Keep the compact Reader source strip, real-availability mode strip, compact overflow, nearby Notebook note-chip trigger, lean Source support, short-document article treatment, and frozen generated outputs intact.
- Retire the redundant document-open `Reader` shell title treatment so an active Reader document opens under a slimmer utility-first topbar instead of a full title banner.

## Why This Stage Exists

- The Stage 789 Reader capture still spends a full top shell bar repeating `Reader` even when the left rail already marks the section and the source strip immediately below identifies the active document.
- That banner adds vertical weight before the reading lane without contributing meaningful document context.
- The next highest-value cleanup is to compact the Reader shell only for active-document reading, while preserving the current empty-state orientation and shared-shell behavior elsewhere.

## Scope

### In scope

- Compact the Reader topbar only when a Reader document is open.
- Hide the visible `Reader` heading in that document-open state while preserving accessible labeling.
- Keep `Search` and `Add` available in the compacted topbar.
- Preserve the existing Reader empty-state topbar behavior when no document is open.
- Add focused tests and live audit metrics for the compact document-open topbar.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No Add / Search behavior changes beyond the compacted presentation.
- No redesign of the left rail, source strip, control ribbon, Source support, or Notebook support beyond regression proof.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/RecallShellFrame.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage790_reader_document_open_topbar_compaction_after_stage789.mjs`
  - `scripts/playwright/stage791_post_stage790_reader_document_open_topbar_compaction_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched shell / Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 790/791 scripts
- live Reader Stage 790/791 audits on `http://127.0.0.1:8000`
- `git diff --check`
