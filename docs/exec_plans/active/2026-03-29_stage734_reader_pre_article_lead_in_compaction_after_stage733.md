# Stage 734 - Reader Pre-Article Lead-In Compaction After Stage 733

## Summary

- Reopen `Reader` intentionally from the completed Stage 733 baseline.
- Keep the compact centered reading deck, inline support seam, and frozen generated outputs intact.
- Reduce the remaining full-width lead-in feel above the article so the source strip reads like the same compact reading band instead of a broader workspace header.

## Why This Stage Exists

- Stage 733 confirmed the true local Reader baseline, but the current at-rest source strip still spans more broadly than the compact reading deck below it.
- That mismatch leaves the pre-article area feeling wider and emptier than the current Recall benchmark direction, even though the article field and control ribbon are already centered and compact.
- The next highest-leverage Reader move is to tighten the source-workspace lead-in without reopening generated-content work or destabilizing Source / Notebook expansion.

## Scope

### In scope

- Add an explicit Reader-only source-strip presentation mode that can stay compact at rest and expand only when nearby support work is opened.
- Recenter the Reader-active source strip against the same compact-width reading band used by the control ribbon and deck in the default at-rest state.
- Tighten the Reader source-strip spacing, tab rhythm, and surrounding gap so the article starts under a calmer, more continuous lead-in.
- Extend the Reader Playwright evidence metrics so the audit proves the default source strip now stays compact-width and centered while Source-open / Notebook-open states remain intact.
- Update roadmap continuity docs after validation.

### Out of scope

- No generated-output text, transform logic, mode payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No new Reader support workflows beyond layout/presentation follow-through.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/index.css`
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage734_reader_pre_article_lead_in_compaction_after_stage733.mjs`
  - `scripts/playwright/stage735_post_stage734_reader_pre_article_lead_in_compaction_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- Stage 734 should explicitly prove:
  - default Reader keeps the compact centered deck and inline support seam
  - the default Reader source strip now shares that compact-width continuity instead of spanning the full stage
  - Source and Notebook support still expand into the attached support rail without route or layout regressions
  - generated empty states remain inline and calm

## Required Checks

- targeted Vitest for `ReaderWorkspace`, `SourceWorkspaceFrame`, and `App`
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 734/735 scripts
- live Reader Stage 734/735 audits on `http://127.0.0.1:8000`
- `git diff --check`
