# Stage 752 - Reader Overflow Source-Action Retirement After Stage 751

## Summary

- Reopen `Reader` intentionally from the completed Stage 751 baseline.
- Keep the compact reading deck, lean source strip, theme-first settings model, idle transport compaction, and frozen generated outputs intact.
- Retire the duplicate overflow `Source` action so the overflow prioritizes `Theme`, `Notebook`, and read-aloud controls.

## Why This Stage Exists

- Stage 751 removed the bulky Reader settings drawer, but the compact overflow still carried two different `Source` affordances with different jobs.
- The source strip already exposes `Source` as the saved-source identity seam, while the overflow still repeated `Source` as a second support-pane launcher.
- The next highest-leverage cleanup is to remove that duplicate overflow action, keep `Notebook` as the one direct support-pane entry, and leave source support reachable from the expanded support tabs when needed.

## Scope

### In scope

- Remove the direct `Source` action from the compact Reader overflow.
- Keep `Notebook` as the direct overflow entry into the expanded Reader support pane.
- Preserve source support access after the support pane opens.
- Keep `Theme`, `Voice`, and `Rate` in the overflow.
- Update targeted Reader tests and Playwright evidence so the slimmer overflow contract is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of the compact source-strip trigger or expanded Reader support tabs once the support pane is open.
- No theme-model changes beyond proving the Stage 751 contract still holds.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage752_reader_overflow_source_action_retirement_after_stage751.mjs`
  - `scripts/playwright/stage753_post_stage752_reader_overflow_source_action_retirement_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `AGENTS.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 752/753 scripts
- live Reader Stage 752/753 audits on `http://127.0.0.1:8000`
- `git diff --check`
