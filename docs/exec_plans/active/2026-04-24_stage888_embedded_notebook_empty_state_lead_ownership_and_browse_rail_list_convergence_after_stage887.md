# Stage 888 - Embedded Notebook Empty-State Lead Ownership And Browse-Rail List Convergence After Stage 887

## Summary

Keep the active section on embedded `Notebook`. Stage 887 fused the selected-note happy path, but no-active and search-empty states still revive the large `Note detail` intro while the left browse rail still reads too much like a boxed mini-panel. This pass makes the command row the only top band across Notebook states and makes the browse rail list-first.

## Scope

- Desktop embedded Notebook in `RecallWorkspace.tsx`.
- Retire the remaining empty-state `Note detail` lead block.
- Flatten browse rail rows, active state, metadata, and header rhythm.
- Preserve selected-note workbench behavior from Stage 886/887.
- Preserve focused Reader-led Notebook as a regression surface.

## Implementation Notes

- Keep Stage 874/875 empty-state copy and actions, including `Capture in Reader`, `Clear search`, and `Open source`.
- Render empty workbench states directly under the command row without reserving a second detail intro.
- Add Stage 888 class hooks for empty workbench and list-first browse rail audit evidence.
- Keep note selection, search, editing, source handoff, Reader handoff, Graph promotion, and Study card creation unchanged.

## Validation

- Targeted Notebook/App Vitest.
- `npm run build`.
- Backend graph pytest.
- `node --check` on shared Notebook harness and Stage 888/889 scripts.
- Live Stage 888/889 browser audits.
- `git diff --check`.

