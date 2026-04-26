# Stage 792 - Reader Document-Open Topbar Utility Deflation After Stage 791

## Summary

- Reopen `Reader` intentionally from the completed Stage 791 baseline.
- Keep the compact Reader source strip, real-availability mode strip, compact overflow, nearby Notebook note-chip trigger, lean Source support, short-document article treatment, and frozen generated outputs intact.
- Deflate the remaining document-open topbar utility chrome so active Reader keeps smaller, calmer `Search` and `Add` actions instead of the old full-size shell buttons.

## Why This Stage Exists

- Stage 791 retired the repeated `Reader` title from the document-open shell, but the remaining `Search` and `Add` controls still use the larger shared-shell button treatment.
- That leaves a noticeable band of utility chrome above the source strip even though the document-open Reader topbar now serves only as a lightweight action seam.
- The next highest-value follow-through is to keep those controls available while shrinking their visual footprint only in active Reader documents.

## Scope

### In scope

- Compact the document-open Reader topbar actions without changing their behavior.
- Hide the visible `Ctrl+K` hint in that compact Reader state if it no longer helps the reading lane.
- Preserve `Search` and `Add` availability and accessibility in the compact state.
- Preserve the current empty-state Reader topbar and non-Reader shared-shell behavior.
- Add focused tests plus live audit metrics for the compact topbar utilities.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No route or modal behavior changes for `Search` or `Add`.
- No redesign of the source strip, control ribbon, Source support, Notebook support, or article field beyond regression proof.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/App.tsx`
  - `frontend/src/components/RecallShellFrame.tsx`
  - `frontend/src/components/RecallShellFrame.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage792_reader_document_open_topbar_utility_deflation_after_stage791.mjs`
  - `scripts/playwright/stage793_post_stage792_reader_document_open_topbar_utility_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 792/793 scripts
- live Reader Stage 792/793 audits on `http://127.0.0.1:8000`
- `git diff --check`
