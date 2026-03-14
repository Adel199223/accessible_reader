# ExecPlan: Stage 24 Reader Notebook Adjacency and In-Place Note Workflows

## Summary
- Completed on 2026-03-14.
- Reader now keeps saved-note editing, promotion, and reopen continuity beside the source instead of forcing routine jumps into the standalone `Notes` section.
- The Reader sidecar behaves more like a lightweight notebook workbench while preserving stable routes, anchors, search continuity, and local-first behavior.

## Implemented
- Expanded the Reader notes sidecar into a notebook-style workbench:
  - selected saved notes now open into a focused detail state instead of remaining list-only
  - note body editing, saving, and deletion now work directly from Reader
  - the saved note remains selected after in-place capture so the user can keep working without losing context
- Brought note-promotion actions into Reader:
  - the active saved note can now promote to Graph from Reader
  - the active saved note can now create a Study card from Reader
  - `Notes` remains the workspace-wide management surface, but it is no longer required for routine note follow-up while reading
- Tightened note continuity and handoff behavior:
  - `Notes` and workspace-search handoffs now focus the matching saved note in Reader
  - anchored reopen highlighting remains stable while the adjacent note workbench changes state
  - the Reader sidecar action now uses `Open in Notes` wording to reflect the new adjacency-first flow

## Validation
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- real Edge smoke via `scripts/playwright/stage24_reader_notebook_adjacency_edge.mjs`
- live artifacts:
  - `output/playwright/stage24-reader-notebook-workbench.png`
  - `output/playwright/stage24-reader-notebook-notes.png`
  - `output/playwright/stage24-reader-notebook-reader-return.png`
  - `output/playwright/stage24-reader-notebook-validation.json`

## Notes
- The first smoke rerun from WSL failed because Playwright looked for a Linux Edge binary. The repo-owned smoke passed after rerunning the same script with Windows Node against the installed Edge browser.
- This slice intentionally improved notebook adjacency without renaming the public section row or changing route contracts.
