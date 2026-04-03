# Stage 764 - Reader Derived Lead-In Deduplication After Stage 763

## Summary

- Reopen `Reader` intentionally from the completed Stage 763 baseline.
- Keep the compact source strip, nearby Notebook note-chip handoff, inline theme choices, compact overflow, short-document article-field treatment, and fused generated empty-state placement intact.
- Remove the remaining duplicated derived-mode framing so `Reflowed`, `Simplified`, and `Summary` stop spending space on both a derived-view badge and repeated explanatory copy above the useful controls.

## Why This Stage Exists

- Stage 763 fused generated Summary state into the derived-context surface and removed redundant Graph / Study quick actions, but the top of the derived card still repeats itself.
- The current surface still spends height on a derived-view badge, a second mode heading, and a context paragraph even when the generated empty-state copy already carries the important message.
- The highest-leverage next step is to compress that derived lead-in so the mode heading, provenance chips, detail controls, and nearby handoffs stay visible with less stacked framing.

## Scope

### In scope

- Retire the duplicated derived-view descriptor badge from active Reader derived modes.
- Keep the mode title and source note, but collapse repeated explanatory copy when generated empty-state messaging is already present.
- Slightly tighten the derived-context and inline generated-empty-state spacing without changing capabilities.
- Add targeted Vitest and Playwright coverage for the deduplicated derived header and the reduced derived-context height.
- Update continuity docs after validation lands.

### Out of scope

- No backend changes.
- No route changes.
- No Reader transport redesign.
- No new settings work.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage764_reader_derived_lead_in_deduplication_after_stage763.mjs`
  - `scripts/playwright/stage765_post_stage764_reader_derived_lead_in_deduplication_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 764/765 scripts
- live Reader Stage 764/765 audits on `http://127.0.0.1:8000`
- `git diff --check`
