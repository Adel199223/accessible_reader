# ExecPlan: Stage 713 Post-Stage-712 Reader Context-Rail Compaction Audit

## Summary

- Audit the Stage 712 Reader context-rail compaction pass against the March 28, 2026 Reader screenshots from this thread and the Stage 711 reading-first baseline.

## Audit Targets

- Idle Reader support tray:
  - compact Source / Notebook rail at rest
  - no explanatory support copy visible in the collapsed state
  - article lane remains dominant
- Expanded support continuity:
  - Source support opens cleanly and reveals the source library
  - Notebook support opens cleanly and reveals the saved-note workbench
  - saved-note editing remains available in Reader context
- Generated-mode continuity:
  - the derived-mode band remains intact
  - `Summary detail` stays inline in `Summary`
  - the summary-empty placeholder path still works when live data does not include a generated summary article
- Regression surfaces:
  - `Home`
  - `Graph`
  - embedded `Notebook`
  - `Study`

## Validation Ladder

- targeted Vitest for Reader route, source strip, and shell continuity
- `npm run build`
- `node --check` for Stage 712/713 Playwright files
- live Windows Edge Stage 713 audit against `http://127.0.0.1:8000`
- `git diff --check`

## Acceptance Bar

- Reader is materially calmer than the Stage 711 baseline in the at-rest support state.
- The compact tray no longer reads like a text-heavy side panel.
- Source and Notebook still expand into the fuller support workflows without regression.
- Generated outputs remain unchanged.
