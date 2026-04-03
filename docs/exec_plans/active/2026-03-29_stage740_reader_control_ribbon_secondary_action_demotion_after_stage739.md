# Stage 740 - Reader Control-Ribbon Secondary-Action Demotion After Stage 739

## Summary

- Reopen `Reader` intentionally from the completed Stage 739 baseline.
- Keep the compact reading deck, available-mode strip cleanup, and frozen generated outputs intact.
- Reduce the remaining at-rest clutter above the article by demoting secondary ribbon actions behind the existing overflow instead of keeping them as equal-weight visible chrome.

## Why This Stage Exists

- Stage 739 cleaned the visible mode strip, but the at-rest Reader ribbon still carries too many co-equal controls above the article.
- The shipped Stage 739 control-ribbon evidence still shows the sentence chip, full transport cluster, settings, overflow, Source / Notebook quick-access tabs, and duplicate support metadata in one row.
- That top chrome is now the main remaining source of visual clutter in the default Reader state.
- The next highest-leverage cleanup is to keep the reading controls primary while moving secondary support actions out of the main eye-line.

## Scope

### In scope

- Keep the visible Reader mode strip compact and aligned to the document's real `available_modes`.
- Keep the core transport controls primary in the visible ribbon.
- Demote secondary at-rest actions such as Source / Notebook quick access, note-entry affordances, and other support utilities into the existing overflow surface.
- Remove duplicated at-rest support metadata from the main ribbon when the same context is already visible in the source strip.
- Keep Source and Notebook expansion reachable without reopening the older stacked control model.
- Update Reader tests and Playwright evidence so the calmer default control ribbon is measurable.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No changes to the Stage 739 available-mode filtering behavior.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/ControlsOverflow.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage740_reader_control_ribbon_secondary_action_demotion_after_stage739.mjs`
  - `scripts/playwright/stage741_post_stage740_reader_control_ribbon_secondary_action_demotion_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- Stage 740 should explicitly prove:
  - the default Reader ribbon no longer shows Source / Notebook quick tabs or duplicate support metadata at rest
  - core transport controls remain directly accessible
  - secondary utilities remain reachable through overflow and still open Source / Notebook / note flows correctly
  - Source-open and Notebook-open expanded states still behave normally once invoked

## Required Checks

- targeted Vitest for `App` plus any touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 740/741 scripts
- live Reader Stage 740/741 audits on `http://127.0.0.1:8000`
- `git diff --check`
