# Stage 804 - Reader Read-Aloud Primary Action Finish After Stage 803

## Summary

- Reopen `Reader` intentionally from the completed Stage 803 baseline.
- Keep the compact topbar, fused compact header row, nearby Notebook note-chip trigger, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Finish the compact Reader `Read aloud` control as a real primary action by restoring a full pill width, keeping the visible label, and replacing the generic idle start icon with a speech-specific start mark.

## Why This Stage Exists

- Stage 802/803 successfully slimmed the fused compact header controls, but the embedded start-state `Read aloud` pill regressed into a clipped pseudo-circle on the live dataset.
- Live inspection showed the compact start button collapsing to roughly `41px` while the label alone needs about `60px`, so the current sizing override is mechanically wrong instead of just visually imperfect.
- The next highest-value Reader cleanup is therefore to finish the primary transport action so it reads clearly as speech playback without undoing the compact fused header work.

## Scope

### In scope

- Restore a full visible `Read aloud` label plus icon for the idle compact primary transport button.
- Replace the idle start-state play icon with a speech-specific start icon.
- Fix the compact embedded transport sizing so the labeled primary button cannot collapse back to the old circular width on desktop Reader.
- Allow the compact control cluster to wrap safely when constrained instead of clipping the primary button.
- Keep pause, resume, stop, overflow contents, and speech behavior unchanged.
- Update focused tests, audit metrics, and live Playwright captures for the finished primary action.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No speech engine logic changes.
- No Source or Notebook expanded-support redesign.
- No topbar redesign.
- No broader transport-family icon redesign beyond the idle start-state speech cue.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage804_reader_read_aloud_primary_action_finish_after_stage803.mjs`
  - `scripts/playwright/stage805_post_stage804_reader_read_aloud_primary_action_finish_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 804/805 scripts
- live Reader Stage 804/805 audits on `http://127.0.0.1:8000`
- `git diff --check`
