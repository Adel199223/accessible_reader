# ExecPlan: Stage 887 Post-Stage-886 Embedded Notebook Selected-Note Workbench Top-Band And Action-Seam Fusion Audit

## Summary
- Validate Stage 886 against the live local app on `http://127.0.0.1:8000`.
- Confirm the embedded Notebook selected-note path no longer reads as a command-row plus large `Note detail` dashboard stack.
- Confirm no-active-note, search-empty, focused Reader-led Notebook, Home, Reader, Graph, and Study baselines remain stable.

## Audit Focus
- Capture selected-note Notebook evidence that the top band is fused, the old `Note detail` intro is gone, and the selected workbench starts earlier.
- Capture selected-note workbench evidence that passage/editor/source/promote actions read as one note-owned surface with compact inline seams.
- Reconfirm Stage 874/875 no-active-note and search-empty Notebook paths keep `Capture in Reader` and workbench-owned empty-state behavior.
- Keep regression captures for Home Stage 885, Add Content, Graph, original-only Reader, Reader active Listen, Study Review, and Study Questions.

## Validation
- targeted Notebook/App Vitest
- `npm run build`
- backend graph pytest
- Stage 886/887 `node --check`
- live Stage 886/887 Playwright runs
- `git diff --check`
