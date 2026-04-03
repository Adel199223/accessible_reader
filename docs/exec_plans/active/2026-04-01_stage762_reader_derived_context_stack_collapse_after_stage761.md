# Stage 762 - Reader Derived-Context Stack Collapse After Stage 761

## Summary

- Reopen `Reader` intentionally from the completed Stage 761 baseline.
- Keep the compact source strip, nearby Notebook note-chip handoff, inline theme choices, compact overflow, and short-document article-field treatment intact.
- Collapse the remaining stacked derived-mode chrome so `Summary` and `Simplified` stop rendering a bulky context slab plus a second generated empty-state slab above the article lane.

## Why This Stage Exists

- Stage 761 fixed the oversized short-document article field, but the next most obvious Reader weight still sits above generated-mode content.
- `Summary` and `Simplified` currently spend one surface on derived context and then another on the generated empty state, which makes the top of the reading lane feel taller and more option-heavy than it needs to be.
- The highest-leverage next step is to fuse those two surfaces and trim redundant derived-mode shortcuts that already exist elsewhere in Reader.

## Scope

### In scope

- Merge the generated `Summary` and `Simplified` empty state into the derived-context surface instead of stacking a second slab beneath it.
- Trim redundant derived-context actions so the nearby `Notebook` and `Reflowed view` handoffs stay available without repeating `Graph` and `Study`.
- Keep generated creation and retry affordances visible inside the compact derived context.
- Add targeted Vitest and Playwright coverage for fused generated-state placement and the leaner derived-context action set.
- Update continuity docs after validation lands.

### Out of scope

- No backend changes.
- No route changes.
- No Reader transport redesign.
- No new settings beyond the existing light/dark theme choice.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage762_reader_derived_context_stack_collapse_after_stage761.mjs`
  - `scripts/playwright/stage763_post_stage762_reader_derived_context_stack_collapse_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 762/763 scripts
- live Reader Stage 762/763 audits on `http://127.0.0.1:8000`
- `git diff --check`
