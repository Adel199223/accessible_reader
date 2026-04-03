# Stage 740 - Reader Idle Transport Compaction After Stage 739

## Summary

- Reopen `Reader` intentionally from the completed Stage 739 baseline.
- Keep the compact reading deck, available-mode strip, source-destination trigger, and frozen generated outputs intact.
- Reduce the remaining top-ribbon clutter by compacting idle read-aloud controls so the default at-rest Reader state shows one primary playback action instead of the full transport cluster.

## Why This Stage Exists

- Stage 739 removed unnecessary mode pills, but the idle Reader ribbon still shows sentence progress plus previous, play, next, and stop controls before playback starts.
- In the current wide-desktop control ribbon, that idle transport cluster now reads as the loudest remaining piece of top chrome.
- The next highest-leverage Reader cleanup is to preserve browser-native speech while making the resting control surface calmer and more obviously reading-first.
- Full transport control should still appear as soon as playback is active or paused, when those controls become relevant.

## Scope

### In scope

- Keep one clear primary read-aloud action visible in the default idle Reader state.
- Hide or demote idle-only secondary transport controls that do not need equal weight before playback starts.
- Retire the at-rest sentence progress chip from the main control ribbon when playback is idle.
- Preserve full transport controls and sentence progress once speech is active or paused.
- Keep `Original` / `Reflowed` mode visibility, `Summary` availability behavior, inline support, note capture, settings, and overflow access intact.
- Extend Reader tests and Playwright evidence so the audit proves the idle ribbon is calmer while active playback affordances remain covered by component tests.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No changes to the available-mode filtering shipped in Stage 738/739.
- No new speech providers or browser-native speech behavior changes beyond control-surface presentation.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage740_reader_idle_transport_compaction_after_stage739.mjs`
  - `scripts/playwright/stage741_post_stage740_reader_idle_transport_compaction_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- Stage 740 should explicitly prove:
  - the default Reader no longer shows the full transport cluster before playback starts
  - the idle ribbon keeps one clear primary read-aloud action visible
  - idle sentence progress no longer consumes main-ribbon space
  - full transport controls still appear when playback is active or paused
  - Source / Notebook expansion and generated-mode empty states stay intact

## Required Checks

- targeted Vitest for `App` plus any touched Reader component coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 740/741 scripts
- live Reader Stage 740/741 audits on `http://127.0.0.1:8000`
- `git diff --check`
