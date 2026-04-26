# Stage 794 - Reader Compact Header Lane Alignment After Stage 793

## Summary

- Reopen `Reader` intentionally from the completed Stage 793 baseline.
- Keep the compact Reader source strip, compact topbar seam, real-availability mode strip, compact overflow, nearby Notebook note-chip trigger, lean Source support, short-document article treatment, and frozen generated outputs intact.
- Tighten the remaining pre-article Reader chrome into one article-first compact header lane so the source strip plus mode or transport row stop reading wider than the article they introduce.

## Why This Stage Exists

- Stage 793 shrank the document-open topbar, but the next strongest piece of visible Reader chrome is still the combined source-strip plus mode or transport band.
- In compact Reader, that header still spans the broader deck while the article itself sits in a narrower field, which makes the page read stretched before the document begins.
- The next highest-value follow-through is to pull the compact source seam and compact control ribbon inward so they feel attached to the article lane instead of the outer deck.

## Scope

### In scope

- Collapse compact Reader source-strip metadata into the same heading seam as `Source` and the title.
- Narrow the compact Reader control ribbon to the same article-adjacent header width.
- Keep `Read aloud` clearly primary while keeping it inside the narrowed compact lane.
- Preserve expanded Source and Notebook support behavior and width.
- Preserve generated-output invariants and derived-mode behavior.
- Add focused tests plus live audit metrics for compact-header alignment.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No topbar, route, or modal behavior changes.
- No redesign of expanded Source support, Notebook workbench, or article-field sizing beyond regression proof.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage794_reader_compact_header_lane_alignment_after_stage793.mjs`
  - `scripts/playwright/stage795_post_stage794_reader_compact_header_lane_alignment_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader or shell coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 794/795 scripts
- live Reader Stage 794/795 audits on `http://127.0.0.1:8000`
- `git diff --check`
