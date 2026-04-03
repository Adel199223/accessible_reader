# Stage 768 - Reader Summary Detail Inline Compaction After Stage 767

## Summary

- Reopen `Reader` intentionally from the completed Stage 767 baseline.
- Keep the compact source strip, nearby Notebook note-chip handoff, compact overflow, short-document article-field treatment, and lean derived metadata states intact.
- Compact the `Summary` lead-in by retiring the extra visible `Detail` label and folding the detail selector into the same lean lead-in surface instead of treating it like a second stacked sub-panel.

## Why This Stage Exists

- Stage 767 removed the last duplicate metadata chips, but the `Summary` lead-in still reads taller and more UI-heavy than the adjacent `Reflowed` and `Simplified` states.
- The current `Summary` block still stacks `Summary`, `From paste source`, a visible `Detail` label, the segmented detail control, and then the inline empty-state message.
- The highest-leverage next step is to preserve summary-detail control while making it feel like one compact part of the same header band.

## Scope

### In scope

- Retire the visible `Detail` label from the `Summary` derived-context surface while preserving accessible labeling for the control group.
- Reflow the `Summary detail` segmented control so it lives inside the same compact lead-in seam instead of as a separate stacked shell.
- Tighten the `Summary` derived-context spacing so the empty-state block starts earlier without disturbing the nearby action column.
- Add targeted Vitest and Playwright coverage for the leaner summary lead-in.
- Update continuity docs after validation lands.

### Out of scope

- No backend changes.
- No transport redesign.
- No source-strip redesign.
- No support-rail redesign.
- No generated-output changes.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage768_reader_summary_detail_inline_compaction_after_stage767.mjs`
  - `scripts/playwright/stage769_post_stage768_reader_summary_detail_inline_compaction_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 768/769 scripts
- live Reader Stage 768/769 audits on `http://127.0.0.1:8000`
- `git diff --check`
