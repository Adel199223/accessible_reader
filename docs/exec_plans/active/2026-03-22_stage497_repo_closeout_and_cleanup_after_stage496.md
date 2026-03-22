# ExecPlan: Stage 497 Repo Closeout And Cleanup After Stage 496

## Summary
- Close out the full pending Stage 369-496 backlog on `codex/stage8-closeout-doc-sync`.
- Publish the backlog in exactly two commits: one assistant-routing/docs-sync commit, then one full product backlog closeout commit.
- Promote the branch to `main`, remove the feature branch locally and on origin, prune stale refs, and verify both local and remote cleanliness.

## Implementation Scope
- Treat the current worktree as one intentional backlog closeout, not as a Stage 495/496-only commit.
- Create one assistant continuity sync first:
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/assistant/manifest.json`
  - `docs/ux/recall_benchmark_matrix.md`
  - this Stage 497 ExecPlan
- Then stage and commit every remaining modified and untracked repo file in the branch backlog.
- Re-run the last known green Stage 495/496 validation ladder before promoting to `main`.
- Push the feature branch, fast-forward `main` to it, push `main`, delete the feature branch locally and on origin, and prune stale refs.

## Acceptance
- The branch ends with exactly two new commits after the current `origin/codex/stage8-closeout-doc-sync` tip.
- `main` matches the promoted branch tip after the fast-forward.
- `origin/codex/stage8-closeout-doc-sync` is deleted after `main` is updated.
- Local `main` is clean, remote-tracking refs are pruned, and `git worktree list` still reports one worktree.
- The Reader lock stays unchanged in the recorded continuity docs: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no generated-view UX, transform, placeholder, control, or mode-routing changes.

## Validation
- `npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for:
  - `scripts/playwright/stage495_home_custom_collection_management_reset_after_stage494.mjs`
  - `scripts/playwright/stage496_post_stage495_home_custom_collection_management_audit.mjs`
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs of Stage 495 and Stage 496
