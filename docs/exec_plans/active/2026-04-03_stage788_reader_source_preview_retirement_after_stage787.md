# Stage 788 - Reader Source Preview Retirement After Stage 787

## Summary

- Reopen `Reader` intentionally from the completed Stage 787 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, leaner Source support, and Stage 786/787 loaded-`Reflowed` cleanup intact.
- Retire the secondary source locator or filename line from Reader-active source strips so the strip stays a one-line identity seam in Reader, while keeping non-Reader source workspace preview behavior unchanged.

## Why This Stage Exists

- The current Reader source strip still renders a second tiny line for `source_locator` or `file_name` on file-backed and URL-backed sources.
- In Reader, that line now reads like leftover metadata because the visible source type, title, and nearby actions already establish enough context.
- The extra line is especially noisy on short titles and is still visible on the live local dataset for the file-backed HTML source shown in the user screenshot.

## Scope

### In scope

- Stop rendering `.source-workspace-source` inside Reader-active source strips.
- Keep `.source-workspace-source` in non-Reader source workspaces outside the Reader-owned surface.
- Preserve Source support, Notebook support, compact destination trigger behavior, note-chip trigger behavior, and generated-output invariants.
- Add audit coverage that targets a real live document with `file_name` or `source_locator`.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No change to source-strip title, note-count chip, or source-type chip semantics.
- No Source support redesign beyond proving it still reopens.
- No Notebook routing redesign.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage788_reader_source_preview_retirement_after_stage787.mjs`
  - `scripts/playwright/stage789_post_stage788_reader_source_preview_retirement_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 788/789 scripts
- live Reader Stage 788/789 audits on `http://127.0.0.1:8000`
- `git diff --check`
