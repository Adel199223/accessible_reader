# Stage 766 - Reader Derived Metadata Deflation After Stage 765

## Summary

- Reopen `Reader` intentionally from the completed Stage 765 baseline.
- Keep the compact source strip, nearby Notebook note-chip handoff, inline theme choices, compact overflow, short-document article-field treatment, and deduplicated derived lead-in intact.
- Remove the remaining duplicated derived metadata so generated and reflowed modes stop repeating source provenance, selected summary detail, and generation-readiness state in a second chip row when those cues are already clearer in the title row, detail control, or inline empty-state messaging.

## Why This Stage Exists

- Stage 765 removed the redundant derived descriptor badge and extra context paragraph, but the next row still repeats too much.
- The current Summary empty state still shows `Paste source`, `Balanced detail`, and `Ready to generate` even though the title row already says `From paste source`, the summary-detail control already marks the selected detail, and the inline empty-state card already explains that generation is available.
- Reflowed still repeats `Paste source` and `Local derived view` below a title row that already carries the mode and provenance.
- The highest-leverage next step is to keep only additive derived metadata and let the title row, controls, and empty-state card do the rest.

## Scope

### In scope

- Retire duplicate source-type chips from the derived metadata row when provenance is already visible in the title row.
- Retire duplicate summary-detail chips from the derived metadata row when the active summary-detail control already conveys the selection.
- Retire low-value readiness chips such as `Ready to generate` and `Local derived view`, while preserving meaningful status chips such as `AI generated`, `Cached`, and `Unavailable` when they add signal.
- Collapse the derived metadata row entirely when no additive metadata remains.
- Add targeted Vitest and Playwright coverage for the leaner derived metadata states.
- Update continuity docs after validation lands.

### Out of scope

- No backend changes.
- No route changes.
- No Reader transport redesign.
- No support-rail redesign.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage766_reader_derived_metadata_deflation_after_stage765.mjs`
  - `scripts/playwright/stage767_post_stage766_reader_derived_metadata_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 766/767 scripts
- live Reader Stage 766/767 audits on `http://127.0.0.1:8000`
- `git diff --check`
