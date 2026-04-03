# Stage 770 - Reader Derived Quick Action Retirement After Stage 769

## Summary

- Reopen `Reader` intentionally from the completed Stage 769 baseline.
- Keep the compact source strip, nearby Notebook note-chip handoff, real-availability mode strip, compact overflow, short-document article-field treatment, and compact `Summary detail` lead-in intact.
- Retire duplicated derived-context quick actions now that those handoffs already live in clearer nearby controls.

## Why This Stage Exists

- The current derived-context action group still repeats `Notebook` and `Reflowed view` inside generated and reflowed modes.
- `Notebook` is already reachable from the source-strip note chip, and `Reflowed` is already a visible top-level mode tab.
- Those extra buttons add option noise without unlocking a new path, and they still reserve a right-side action column even when they are the only actions present.

## Scope

### In scope

- Retire the duplicated derived-context `Notebook` action.
- Retire the duplicated derived-context `Reflowed view` action.
- Keep `Create Summary`, `Create Simplified`, and `Retry loading` visible when they still matter.
- Collapse the derived-context action column entirely when no create/retry action remains.
- Tighten any derived-context copy that still describes those removed quick actions as if they were local controls.
- Add targeted Vitest and Playwright coverage for the leaner action state.
- Update continuity docs after validation lands.

### Out of scope

- No backend changes.
- No mode-routing changes.
- No source-strip redesign.
- No transport redesign.
- No generated-output changes.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage770_reader_derived_quick_action_retirement_after_stage769.mjs`
  - `scripts/playwright/stage771_post_stage770_reader_derived_quick_action_retirement_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 770/771 scripts
- live Reader Stage 770/771 audits on `http://127.0.0.1:8000`
- `git diff --check`
