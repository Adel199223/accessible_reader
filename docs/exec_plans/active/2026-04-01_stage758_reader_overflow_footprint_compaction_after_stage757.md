# Stage 758 - Reader Overflow Footprint Compaction After Stage 757

## Summary

- Reopen `Reader` intentionally from the completed Stage 757 baseline.
- Keep the compact reading deck, lean source strip, nearby Notebook note-chip trigger, inline theme choices, and frozen generated outputs intact.
- Reduce the physical size and visual interruption of the remaining active-reading overflow so it reads like one compact utility popover instead of a second floating panel over the article.

## Why This Stage Exists

- Stage 757 removed the last unnecessary quick-action layer from active Reader, but the overflow still occupies a large vertical card footprint when opened.
- The remaining controls are now appropriate, yet their presentation still feels heavier than the problem they solve.
- The next highest-leverage cleanup is to compact the same theme/voice/rate controls into a tighter, more deliberate utility surface without hiding needed access.

## Scope

### In scope

- Tighten the active Reader overflow layout, spacing, and sizing.
- Keep inline `Light` / `Dark` theme choices visible inside the overflow.
- Keep `Voice` and `Rate` reachable while making their layout more compact.
- Keep the empty-state Reader theme access intact.
- Update targeted tests and Playwright evidence so the tighter overflow footprint is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of theme, voice, or rate controls.
- No removal of the source-strip `Source` trigger or the nearby Notebook note-chip trigger.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ControlsOverflow.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage758_reader_overflow_footprint_compaction_after_stage757.mjs`
  - `scripts/playwright/stage759_post_stage758_reader_overflow_footprint_compaction_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 758/759 scripts
- live Reader Stage 758/759 audits on `http://127.0.0.1:8000`
- `git diff --check`
