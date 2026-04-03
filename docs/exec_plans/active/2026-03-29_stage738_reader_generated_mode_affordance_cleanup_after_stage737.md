# Stage 738 - Reader Generated-Mode Affordance Cleanup After Stage 737

## Summary

- Reopen `Reader` intentionally from the completed Stage 737 baseline.
- Keep the compact reading deck, source-destination trigger, and frozen generated outputs intact.
- Reduce the remaining top-chrome clutter by making the visible Reader mode strip follow each document's real `available_modes`.

## Why This Stage Exists

- Stage 737 removed the stacked cross-surface row, but the default Reader still exposes four equal-weight mode pills at rest.
- On the current live dataset, `Simplified` is unavailable (`simplifiedViewAvailable: false`), yet it still occupies a visible top-row slot and makes the mode strip feel busier than necessary.
- Optional generated views should only appear in the visible mode strip when the active document actually exposes them.
- The next highest-leverage cleanup is to keep `Original` and `Reflowed` primary at rest, hide unavailable generated modes from the default strip, and preserve generated create/switch behavior only when those modes are truly available.

## Scope

### In scope

- Keep `Original` and `Reflowed` as the primary visible mode controls in the Reader ribbon.
- Keep the visible Reader mode strip and the settings `Document view` controls aligned with the active document's real `available_modes`.
- Hide unavailable AI-generated views from the default at-rest controls instead of keeping them as equal-weight resting pills.
- Preserve generated-mode empty states and create actions when the user is already in an actually supported generated mode.
- Keep active generated modes legible when the user is already in `Summary` or another available generated view.
- Extend the Reader Playwright evidence so the audit proves the top mode strip is calmer in the default at-rest Reader state.
- Update roadmap continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No new AI products or capabilities beyond visibility cleanup for existing `Simplify` / `Summary`.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SettingsPanel.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage738_reader_generated_mode_affordance_cleanup_after_stage737.mjs`
  - `scripts/playwright/stage739_post_stage738_reader_generated_mode_affordance_cleanup_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- Stage 738 should explicitly prove:
  - the default Reader no longer presents unavailable AI modes as equal-weight top-row pills
  - `Original` and `Reflowed` remain the visible controls for documents that only expose those two modes
  - the visible mode strip and settings drawer both follow the current document's real `available_modes`
  - generated empty states and create actions still work
  - Source / Notebook expansion and the compact source-destination trigger stay intact

## Required Checks

- targeted Vitest for `App` plus any touched Reader component coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 738/739 scripts
- live Reader Stage 738/739 audits on `http://127.0.0.1:8000`
- `git diff --check`
