# ExecPlan: Stage 41 Recall Shared Shell And Surface Convergence

## Summary
- Stage 40 locked the benchmark direction: shared shell first, then top-level surface convergence across Library, Add Content, Graph, and Study.
- This slice materially moved the app toward that benchmark without reopening backend, route, anchor, or reader deep-link scope.
- Browse-first entry from Stage 37 and reader-led focused work from Stage 34 remained intact.

## Landed Behavior
- Shared shell:
  - the left rail and top utility bar are slimmer and calmer
  - the focused top bar no longer repeats an extra section chip when the compact source strip is already present
  - the utility dock now stays out of browse-mode `Graph` and `Study`, instead of following every non-library browse surface
- Library / home:
  - the default landing now uses a two-zone sidebar + collection canvas layout instead of a flat wall of equally weighted cards
  - `Add source` moved out of the main card wall into the supporting sidebar and remains reachable from the shell-level `New` action
  - search, resume, and quick-reopen affordances now live in the sidebar so the main canvas can stay focused on saved sources
- Add Content:
  - the global add-source dialog now groups import paths into explicit `Paste text`, `Web page`, and `Choose file` modes
  - the primary import surface and support copy now read more like one deliberate modal instead of a generic stacked form
- Graph:
  - browse-mode `Graph` now drops the extra utility dock
  - node detail now opens with a graph-stage summary and lighter supporting metadata before mentions and relations
- Study:
  - browse-mode `Study` now drops the extra utility dock
  - the active card now starts with a clearer review journey, condensed scheduling summary, and a more intentional reveal flow

## Validation
- File-scoped ESLint on touched frontend files:
  - `./node_modules/.bin/eslint src/App.tsx src/components/ImportPanel.tsx src/components/RecallShellFrame.tsx src/components/RecallWorkspace.tsx src/components/SourceWorkspaceFrame.tsx --format json`
- `frontend npm run build`
- `frontend vitest run src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- repo-owned real Edge screenshot harness via `node scripts/playwright/stage41_shared_shell_convergence_edge.mjs`

## Artifacts
- `output/playwright/stage41-library-landing-desktop.png`
- `output/playwright/stage41-library-landing-tablet.png`
- `output/playwright/stage41-add-content-dialog-desktop.png`
- `output/playwright/stage41-graph-desktop.png`
- `output/playwright/stage41-study-desktop.png`
- `output/playwright/stage41-focused-notes-desktop.png`
- `output/playwright/stage41-shared-shell-convergence-validation.json`

## Notes
- Stage 41 materially improves shell structure and surface framing, but the fresh captures still show the next benchmark gap: on populated data, Library remains too dense, Graph is still more detail-first than canvas-first, and Study still carries heavier queue chrome than the benchmark.
- `frontend npm run lint` remains inconsistent through the current WSL/UNC execution path for this repo, so the trustworthy lint signal for this slice was direct ESLint on the touched frontend files.
- The large `frontend/src/App.test.tsx` file continues to be a flaky/stalling validation target; the reliable gates remain targeted Vitest plus the real Edge screenshot harness.
